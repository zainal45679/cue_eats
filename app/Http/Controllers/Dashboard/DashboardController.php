<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\InventoryBalance;
use App\Models\InventoryLedger;
use App\Models\BusinessLocation;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $locationId = auth()->user()->hasRole('admin') 
            ? session('active_location_id') 
            : auth()->user()->business_location_id;

        $today = Carbon::today();

        // 1. KPI Metrics
        $completedOrdersToday = Order::when($locationId, fn($q) => $q->where('business_location_id', $locationId))
            ->whereDate('created_at', $today)
            ->where('status', 'Completed');
            
        $todaysRevenue = (float) $completedOrdersToday->sum('grand_total');
        $todaysOrders = $completedOrdersToday->count();
        $aov = $todaysOrders > 0 ? $todaysRevenue / $todaysOrders : 0;

        $canceledOrders = Order::when($locationId, fn($q) => $q->where('business_location_id', $locationId))
            ->whereDate('created_at', $today)
            ->where('status', 'Canceled')
            ->count();

        // 2. Order Types Breakdown
        $orderTypes = Order::when($locationId, fn($q) => $q->where('business_location_id', $locationId))
            ->whereDate('created_at', $today)
            ->select('order_type', DB::raw('count(*) as count'), DB::raw('SUM(grand_total) as revenue'))
            ->groupBy('order_type')
            ->get();

        // 3. Kitchen Status Breakdown
        $kitchenStatus = Order::when($locationId, fn($q) => $q->where('business_location_id', $locationId))
            ->whereDate('created_at', $today)
            ->select('kitchen_status', DB::raw('count(*) as count'))
            ->groupBy('kitchen_status')
            ->pluck('count', 'kitchen_status')
            ->toArray();
            
        $activeOrders = ($kitchenStatus['pending'] ?? 0) + ($kitchenStatus['preparing'] ?? 0);

        // 4. Cashier Performance Leaderboard
        $cashierPerformance = Order::when($locationId, fn($q) => $q->where('business_location_id', $locationId))
            ->whereDate('created_at', $today)
            ->where('status', 'Completed')
            ->select('user_id', DB::raw('count(*) as orders_count'), DB::raw('SUM(grand_total) as total_revenue'))
            ->groupBy('user_id')
            ->with('cashier:id,name')
            ->orderByDesc('total_revenue')
            ->take(5)
            ->get()
            ->map(function($perf) {
                return [
                    'name' => $perf->cashier ? $perf->cashier->name : 'System',
                    'orders' => $perf->orders_count,
                    'revenue' => (float) $perf->total_revenue
                ];
            });

        // 5. Inventory: Top Consumed Today
        $topConsumed = InventoryLedger::when($locationId, fn($q) => $q->where('business_location_id', $locationId))
            ->whereDate('created_at', $today)
            ->where('transaction_type', 'sale') // Deductions
            ->select('ingredient_id', DB::raw('SUM(ABS(quantity)) as total_consumed'))
            ->groupBy('ingredient_id')
            ->with('ingredient.baseUom')
            ->orderByDesc('total_consumed')
            ->take(5)
            ->get()
            ->map(function($ledger) {
                return [
                    'name' => $ledger->ingredient ? $ledger->ingredient->name : 'Unknown',
                    'quantity' => $ledger->total_consumed,
                    'uom' => $ledger->ingredient && $ledger->ingredient->baseUom ? $ledger->ingredient->baseUom->code : ''
                ];
            });

        // 6. Inventory: Detailed Low Stock Alerts
        $lowStockItems = InventoryBalance::when($locationId, function($q) use ($locationId) {
                $q->whereHas('storageLocation', fn($sq) => $sq->where('business_location_id', $locationId));
            })
            ->where('available_qty', '<=', 10) // Threshold can be dynamic later
            ->with(['ingredient.baseUom', 'storageLocation'])
            ->orderBy('available_qty', 'asc')
            ->take(10)
            ->get()
            ->map(function($balance) {
                return [
                    'name' => $balance->ingredient ? $balance->ingredient->name : 'Unknown',
                    'qty' => $balance->available_qty,
                    'uom' => $balance->ingredient && $balance->ingredient->baseUom ? $balance->ingredient->baseUom->code : '',
                    'location' => $balance->storageLocation ? $balance->storageLocation->storage_name : 'Main'
                ];
            });

        // 7. Sales Trend (Last 7 Days)
        $last7Days = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $revenue = Order::when($locationId, fn($q) => $q->where('business_location_id', $locationId))
                ->whereDate('created_at', $date)
                ->where('status', 'Completed')
                ->sum('grand_total');
            
            $last7Days->push([
                'name' => $date->format('M d'),
                'revenue' => (float) $revenue
            ]);
        }

        return Inertia::render('dashboard/index', [
            'metrics' => [
                'todaysRevenue' => $todaysRevenue,
                'todaysOrders' => $todaysOrders,
                'activeOrders' => $activeOrders,
                'aov' => $aov,
                'canceledOrders' => $canceledOrders
            ],
            'kitchen' => [
                'pending' => $kitchenStatus['pending'] ?? 0,
                'preparing' => $kitchenStatus['preparing'] ?? 0,
                'ready' => $kitchenStatus['ready'] ?? 0,
            ],
            'orderTypes' => $orderTypes,
            'cashierPerformance' => $cashierPerformance,
            'topConsumed' => $topConsumed,
            'lowStockItems' => $lowStockItems,
            'salesTrend' => $last7Days,
        ]);
    }
}

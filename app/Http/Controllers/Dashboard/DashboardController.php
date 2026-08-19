<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\InventoryBalance;
use App\Models\InventoryLedger;
use App\Models\BusinessLocation;
use App\Models\User;
use App\Models\Ingredient;
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

        // Helper closure to apply optional location filter
        $applyLocationFilter = function ($query) use ($locationId) {
            if ($locationId) {
                $query->where('business_location_id', $locationId);
            }
            return $query;
        };

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
            ->where('transaction_type', 'sale')
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

        // 6. Inventory: Detailed Low Stock Alerts (Branch-Aggregated Purchasing Alert)
        $lowStockItems = Ingredient::where('is_inventory_item', true)
            ->with('baseUom')
            ->select('id', 'name', 'base_uom_id')
            ->selectSub(function ($query) use ($locationId) {
                $query->from('inventory_balances')
                    ->join('storage_locations', 'inventory_balances.storage_location_id', '=', 'storage_locations.id')
                    ->whereColumn('inventory_balances.ingredient_id', 'ingredients.id')
                    ->where('storage_locations.status', true);

                if ($locationId) {
                    $query->where('storage_locations.business_location_id', $locationId);
                }

                $query->select(DB::raw('COALESCE(SUM(inventory_balances.available_qty), 0)'));
            }, 'total_available')
            ->groupBy('ingredients.id')
            ->having('total_available', '<=', 10)
            ->orderBy('total_available', 'asc')
            ->take(10)
            ->get()
            ->map(function ($ingredient) {
                return [
                    'name' => $ingredient->name,
                    'qty' => (float) $ingredient->total_available,
                    'uom' => $ingredient->baseUom ? $ingredient->baseUom->code : '',
                    'location' => 'Branch Total'
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

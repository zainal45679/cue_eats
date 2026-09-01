<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\InventoryLedger;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->input('date', Carbon::today()->toDateString());
        $startDate = Carbon::parse($date)->startOfDay();
        $endDate = Carbon::parse($date)->endOfDay();
        
        $locationId = auth()->user()->hasRole('admin') 
            ? session('active_location_id') 
            : auth()->user()->business_location_id;

        // 1. Order Metrics
        $ordersQuery = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'Completed');
            
        if ($locationId) {
            $ordersQuery->where('business_location_id', $locationId);
        }
        
        $totalRevenue = (clone $ordersQuery)->sum('grand_total');
        $totalDiscounts = (clone $ordersQuery)->sum('discount_total');
        $orderCount = (clone $ordersQuery)->count();
        
        $cashSales = (clone $ordersQuery)->where('payment_method', 'Cash')->sum('grand_total');
        $cardSales = (clone $ordersQuery)->where('payment_method', 'Card')->sum('grand_total');

        // 2. Top Selling Items
        $topItemsQuery = OrderItem::select('menu_item_id', DB::raw('SUM(quantity) as total_quantity'), DB::raw('SUM(subtotal) as total_sales'))
            ->whereHas('order', function($q) use ($startDate, $endDate, $locationId) {
                $q->whereBetween('created_at', [$startDate, $endDate])
                  ->where('status', 'Completed');
                if ($locationId) {
                    $q->where('business_location_id', $locationId);
                }
            })
            ->with('menuItem:id,name,image')
            ->groupBy('menu_item_id')
            ->orderByDesc('total_quantity')
            ->take(5)
            ->get();

        // 3. Wastage Report
        $wastageQuery = InventoryLedger::with(['ingredient:id,name,base_uom_id', 'ingredient.baseUom:id,code,name'])
            ->where('transaction_type', 'wastage')
            ->whereBetween('created_at', [$startDate, $endDate]);
            
        if ($locationId) {
            $wastageQuery->where('business_location_id', $locationId);
        }
        
        $wastageLogs = $wastageQuery->latest()->get()->map(function($log) {
            return [
                'id' => $log->id,
                'name' => $log->ingredient ? $log->ingredient->name : 'Unknown Ingredient',
                'quantity' => abs($log->quantity),
                'unit' => $log->ingredient && $log->ingredient->baseUom ? ($log->ingredient->baseUom->code ?: $log->ingredient->baseUom->name) : '',
                'reference' => $log->reference_type . ' (' . substr($log->reference_id, 0, 8) . ')',
                'time' => $log->created_at->format('h:i A'),
            ];
        });

        return Inertia::render('menu-pos/reports/index', [
            'date' => $date,
            'metrics' => [
                'revenue' => $totalRevenue,
                'discounts' => $totalDiscounts,
                'orders' => $orderCount,
                'cash' => $cashSales,
                'card' => $cardSales,
            ],
            'topItems' => $topItemsQuery,
            'wastage' => $wastageLogs
        ]);
    }
}

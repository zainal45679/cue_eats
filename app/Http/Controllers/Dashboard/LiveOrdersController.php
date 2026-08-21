<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Helpers\TableHelper;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LiveOrdersController extends Controller
{
    public function index(Request $request)
    {
        $locationId = auth()->user()->hasRole('admin') 
            ? session('active_location_id') 
            : auth()->user()->business_location_id;

        // Base query for active operational live orders across all order types (Dine-in, Takeaway, Delivery):
        // An order is active if:
        // 1. It is not cancelled and not kitchen-rejected.
        // 2. AND EITHER:
        //    a) Kitchen status is 'pending' or 'preparing' (food is actively being prepared, regardless of payment status)
        //    b) OR payment/status is not settled ('Completed'/'completed'/'paid') while kitchen status is 'ready'.
        $baseQuery = Order::with([
            'items.menuItem',
            'items.modifiers.modifier',
            'cashier',
            'diningTable',
            'waiter'
        ])
            ->when($locationId, fn($q) => $q->where('business_location_id', $locationId))
            ->whereNotIn('status', ['cancelled'])
            ->where('kitchen_status', '!=', 'rejected')
            ->where(function ($query) {
                $query->whereIn('kitchen_status', ['pending', 'preparing'])
                      ->orWhere(function ($sub) {
                          $sub->whereNotIn('status', ['Completed', 'completed', 'paid'])
                              ->where('kitchen_status', 'ready');
                      });
            });

        // Compute full active dataset KPI statistics before applying status tab, search, or pagination
        $statsQuery = clone $baseQuery;
        $activeOrders = $statsQuery->get();

        $stats = [
            'total_active' => $activeOrders->count(),
            'pending' => $activeOrders->where('kitchen_status', 'pending')->count(),
            'preparing' => $activeOrders->where('kitchen_status', 'preparing')->count(),
            'ready' => $activeOrders->where('kitchen_status', 'ready')->count(),
            'total_value' => (float) $activeOrders->sum(fn($order) => (float) ($order->grand_total ?? 0)),
        ];

        // Status tab filtering (All Orders, Pending, Preparing, Ready)
        $statusTab = $request->input('status', 'all');
        $tableQuery = clone $baseQuery;

        if ($statusTab && in_array($statusTab, ['pending', 'preparing', 'ready'], true)) {
            $tableQuery->where('kitchen_status', $statusTab);
        }

        $ordersData = TableHelper::query($tableQuery)
            ->defaultSort('created_at', true)
            ->searchColumns([
                'order_number',
                'customer_name',
                'order_type',
                'cashier.name',
                'diningTable.name',
                'waiter.name',
            ])
            ->get();

        return Inertia::render('menu-pos/live-orders/index', [
            'orders' => $ordersData,
            'stats' => $stats,
            'activeStatus' => $statusTab ?: 'all',
        ]);
    }
}

<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KdsController extends Controller
{
    public function index()
    {
        $locationId = auth()->user()->hasRole('admin') 
            ? session('active_location_id') 
            : auth()->user()->business_location_id;

        $orders = Order::with([
            'items.menuItem',
            'items.modifiers.modifier',
            'kots.items.menuItem',
            'kots.items.modifiers.modifier',
            'diningTable',
            'waiter'
        ])
            ->when($locationId, fn($q) => $q->where('business_location_id', $locationId))
            ->whereIn('kitchen_status', ['pending', 'preparing'])
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('menu-pos/kds/index', [
            'orders' => $orders,
            'locationId' => $locationId
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'kitchen_status' => 'required|in:pending,preparing,ready,rejected',
            'rejection_reason' => 'nullable|string'
        ]);

        $order->update([
            'kitchen_status' => $validated['kitchen_status'],
            'rejection_reason' => $validated['rejection_reason'] ?? null
        ]);

        // Sync all KOT rounds to this status
        \App\Models\PosKot::where('pos_order_id', $order->id)->update([
            'status' => $validated['kitchen_status']
        ]);

        // Deduct inventory when order is being prepared or ready in KDS (if not already deducted)
        if (in_array($validated['kitchen_status'], ['preparing', 'ready'])) {
            \App\Services\InventoryDeductionService::deductOrder($order, true);
        }

        return back()->with('success', 'Order status updated.');
    }

    public function updateKotStatus(Request $request, \App\Models\PosKot $kot)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,preparing,ready,rejected',
        ]);

        $kot->update(['status' => $validated['status']]);

        $order = $kot->order;
        if ($order) {
            $allKots = \App\Models\PosKot::where('pos_order_id', $order->id)->get();
            $allReady = $allKots->every(fn($k) => $k->status === 'ready');
            $anyPreparing = $allKots->contains(fn($k) => in_array($k->status, ['preparing', 'ready']));

            if ($allReady) {
                $order->update(['kitchen_status' => 'ready']);
            } elseif ($anyPreparing) {
                $order->update(['kitchen_status' => 'preparing']);
            }

            if (in_array($validated['status'], ['preparing', 'ready'])) {
                \App\Services\InventoryDeductionService::deductOrder($order, true);
            }
        }

        return back()->with('success', 'KOT Round status updated.');
    }
}

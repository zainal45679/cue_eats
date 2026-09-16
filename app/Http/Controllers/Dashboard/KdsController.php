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
            ? session('active_location_id', \App\Models\BusinessLocation::first()?->id) 
            : auth()->user()->business_location_id;

        abort_if(! auth()->user()->hasRole('admin') && ! $locationId, 403, 'No outlet is assigned to this user.');

        $orders = Order::with([
            'items.menuItem',
            'items.modifiers.modifier',
            'items.voidedBy',
            'kots.items.menuItem',
            'kots.items.modifiers.modifier',
            'kots.items.voidedBy',
            'diningTable',
            'waiter'
        ])
            ->when($locationId, fn($q) => $q->where('business_location_id', $locationId))
            ->where(function ($query) {
                $query->whereIn('kitchen_status', ['pending', 'preparing'])
                      ->orWhere(function ($q) {
                          $q->where('kitchen_status', 'cancelled')
                            ->whereNull('kitchen_dismissed_at')
                            ->where('updated_at', '>=', now()->subHours(2));
                      });
            })
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('menu-pos/kds/index', [
            'orders' => $orders,
            'locationId' => $locationId
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $this->authorizeOrderAccess($order);

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

        try {
            event(new \App\Events\OrderStatusUpdated($order));
            if ($order->dining_table_id) {
                event(new \App\Events\TableStatusUpdated($order->dining_table_id, $order->business_location_id));
            }
        } catch (\Throwable $e) {
            \Log::warning('Broadcast failed in KDS updateStatus: ' . $e->getMessage());
        }

        return back()->with('success', 'Order status updated.');
    }

    public function updateKotStatus(Request $request, \App\Models\PosKot $kot)
    {
        $order = $kot->order;
        abort_if(! $order, 404);
        $this->authorizeOrderAccess($order);

        $validated = $request->validate([
            'status' => 'required|in:pending,preparing,ready,rejected',
        ]);

        $kot->update(['status' => $validated['status']]);

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

            try {
                event(new \App\Events\OrderStatusUpdated($order));
                if ($order->dining_table_id) {
                    event(new \App\Events\TableStatusUpdated($order->dining_table_id, $order->business_location_id));
                }
            } catch (\Throwable $e) {
                \Log::warning('Broadcast failed in KDS updateKotStatus: ' . $e->getMessage());
            }
        }

        return back()->with('success', 'KOT Round status updated.');
    }

    public function dismissOrder(Request $request, Order $order)
    {
        $this->authorizeOrderAccess($order);

        $order->update([
            'kitchen_dismissed_at' => now(),
        ]);

        try {
            event(new \App\Events\OrderStatusUpdated($order));
        } catch (\Throwable $e) {
            \Log::warning('Broadcast failed in KDS dismissOrder: ' . $e->getMessage());
        }

        return back()->with('success', 'Order dismissed from Kitchen Display.');
    }

    private function authorizeOrderAccess(Order $order): void
    {
        $user = auth()->user();

        abort_if(
            ! $user->hasRole('admin') && $user->business_location_id !== $order->business_location_id,
            403,
            'You are not authorized to manage orders for this outlet.'
        );
    }
}

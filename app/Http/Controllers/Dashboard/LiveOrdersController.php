<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class LiveOrdersController extends Controller
{
    public function index()
    {
        $locationId = auth()->user()->hasRole('admin') 
            ? session('active_location_id') 
            : auth()->user()->business_location_id;

        // Fetch active live kitchen orders (pending, preparing) + ready orders from the last 30 minutes
        $orders = Order::with([
            'items.menuItem', 
            'items.modifiers.modifier', 
            'items.voidedBy',
            'kots.items.menuItem', 
            'kots.items.modifiers.modifier', 
            'kots.items.voidedBy',
            'diningTable', 
            'waiter', 
            'cashier'
        ])
            ->when($locationId, fn($q) => $q->where('business_location_id', $locationId))
            ->where('status', '!=', 'draft')
            ->where('status', '!=', 'cancelled')
            ->whereHas('items')
            ->where(function ($query) {
                // Active kitchen orders (pending, preparing, or unassigned)
                $query->where(function ($q) {
                    $q->whereIn('status', ['running', 'billed'])
                      ->where(function ($k) {
                          $k->whereIn('kitchen_status', ['pending', 'preparing'])
                            ->orWhereNull('kitchen_status');
                      });
                })
                // Ready orders from the last 30 minutes
                ->orWhere(function ($q) {
                    $q->where('kitchen_status', 'ready')
                      ->where('updated_at', '>=', now()->subMinutes(30));
                });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('menu-pos/live-orders/index', [
            'orders' => $orders,
            'locationId' => $locationId ? (string) $locationId : null
        ]);
    }

    public function cancelOrder(Request $request, Order $order)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:255',
            'is_wasted' => 'boolean',
            'manager_pin' => 'nullable|string',
        ]);
        
        if ($order->status === 'cancelled') {
            return back()->withErrors(['error' => 'Order is already cancelled.']);
        }

        $isCooking = in_array($order->kitchen_status, ['preparing', 'ready']);
        $isWaiter = auth()->user()->hasRole('waiter') && !auth()->user()->hasRole('admin') && !auth()->user()->hasRole('outlet_manager');

        // Require Manager PIN if waiter attempts to cancel order when kitchen is already cooking
        if ($isCooking && $isWaiter) {
            if (empty($validated['manager_pin'])) {
                return back()->withErrors(['manager_pin' => 'Manager authorization required: Kitchen has already started preparing this order.']);
            }
            $validPin = \App\Models\User::role(['admin', 'outlet_manager'])
                ->where('manager_pin', $validated['manager_pin'])
                ->exists();

            if (!$validPin) {
                return back()->withErrors(['manager_pin' => 'Invalid Manager PIN.']);
            }
        }

        $isWasted = $isCooking ? true : ($validated['is_wasted'] ?? false);

        // 1. Update statuses (keep on KDS as 'cancelled' so chef gets alerted)
        $order->update([
            'status' => 'cancelled',
            'kitchen_status' => 'cancelled',
            'rejection_reason' => $validated['reason'],
            'kitchen_dismissed_at' => null,
        ]);

        // Sync all KOT rounds and void items
        $kots = \App\Models\PosKot::where('pos_order_id', $order->id)->get();
        foreach ($kots as $kot) {
            $kot->update(['status' => 'rejected']);
            \App\Models\PosKotItem::where('pos_kot_id', $kot->id)
                ->where('is_voided', false)
                ->update([
                    'is_voided' => true,
                    'void_reason' => $validated['reason'],
                    'voided_at' => now(),
                    'voided_by' => auth()->id(),
                ]);
        }

        // Mark all order items as voided
        $order->items()->where('is_voided', false)->update([
            'is_voided' => true,
            'void_reason' => $validated['reason'],
            'voided_at' => now(),
            'voided_by' => auth()->id(),
        ]);

        // 2. Revert Inventory
        \App\Services\InventoryDeductionService::revertOrder($order, $isWasted);

        // 3. Release table if assigned
        if ($order->dining_table_id) {
            $table = \App\Models\DiningTable::find($order->dining_table_id);
            if ($table) {
                $table->status = 'available';
                $table->save();
            }
        }

        // 4. Inform KDS and Tables
        try {
            event(new \App\Events\OrderCreated($order));
            event(new \App\Events\OrderStatusUpdated($order));
            if ($order->dining_table_id) {
                event(new \App\Events\TableStatusUpdated($order->dining_table_id, $order->business_location_id));
            }
        } catch (\Throwable $e) {
            \Log::warning('Broadcast failed in cancelOrder: ' . $e->getMessage());
        }

        return back()->with('success', 'Order cancelled successfully' . ($isWasted ? ' (logged as kitchen wastage).' : ' and inventory restored.'));
    }

    public function cancelOrderItem(Request $request, \App\Models\OrderItem $item)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:255',
            'is_wasted' => 'boolean',
            'manager_pin' => 'nullable|string',
        ]);
        
        $order = $item->order;

        if (!$order || $order->status === 'cancelled') {
            return back()->withErrors(['error' => 'Order is already cancelled.']);
        }

        // Check if item's KOT or order is currently being prepared or ready
        $kot = \App\Models\PosKot::where('pos_order_id', $order->id)
            ->when($item->kot_round, fn($q) => $q->where('round_number', $item->kot_round))
            ->first();
            
        $isCooking = in_array($order->kitchen_status, ['preparing', 'ready']) || ($kot && in_array($kot->status, ['preparing', 'ready']));
        $isWaiter = auth()->user()->hasRole('waiter') && !auth()->user()->hasRole('admin') && !auth()->user()->hasRole('outlet_manager');

        // Require Manager PIN if waiter attempts to void an item currently cooking
        if ($isCooking && $isWaiter) {
            if (empty($validated['manager_pin'])) {
                return back()->withErrors(['manager_pin' => 'Manager authorization required: Kitchen has already started preparing this item.']);
            }
            $validPin = \App\Models\User::role(['admin', 'outlet_manager'])
                ->where('manager_pin', $validated['manager_pin'])
                ->exists();

            if (!$validPin) {
                return back()->withErrors(['manager_pin' => 'Invalid Manager PIN.']);
            }
        }

        $isWasted = $isCooking ? true : ($validated['is_wasted'] ?? false);

        // 1. Revert Inventory for this item
        \App\Services\InventoryDeductionService::revertOrderItem($item, $isWasted);

        // 2. Adjust Order Totals
        $order->subtotal = max(0, $order->subtotal - $item->subtotal);
        $order->grand_total = max(0, $order->grand_total - $item->subtotal);
        $order->save();

        // 3. Mark matching KOT item as VOIDED (Do NOT delete, so KDS can display the strike-through!)
        if (!$kot) {
            $kot = \App\Models\PosKot::where('pos_order_id', $order->id)->latest()->first();
        }

        if ($kot) {
            $kotItem = \App\Models\PosKotItem::where('pos_kot_id', $kot->id)
                ->where('menu_item_id', $item->menu_item_id)
                ->where('is_voided', false)
                ->first();
                
            if ($kotItem) {
                $kotItem->update([
                    'is_voided' => true,
                    'void_reason' => $validated['reason'],
                    'voided_at' => now(),
                    'voided_by' => auth()->id(),
                ]);
            }
        }

        // 4. Mark the order item as VOIDED (Do NOT delete, so audit history remains intact)
        $item->update([
            'is_voided' => true,
            'void_reason' => $validated['reason'],
            'voided_at' => now(),
            'voided_by' => auth()->id(),
        ]);

        // 5. If no active items left, cancel the entire order and inform kitchen
        $remainingActiveItems = $order->items()->where('is_voided', false)->count();
        if ($remainingActiveItems === 0) {
            $order->update([
                'status' => 'cancelled',
                'kitchen_status' => 'cancelled',
                'rejection_reason' => 'All items voided: ' . $validated['reason'],
                'kitchen_dismissed_at' => null,
            ]);
            \App\Models\PosKot::where('pos_order_id', $order->id)->update(['status' => 'rejected']);

            if ($order->dining_table_id) {
                $table = \App\Models\DiningTable::find($order->dining_table_id);
                if ($table) {
                    $table->status = 'available';
                    $table->save();
                }
            }
        }

        // 6. Inform KDS, POS, and Tables via WebSockets
        try {
            $order->load([
                'items.menuItem',
                'items.modifiers.modifier',
                'items.voidedBy',
                'kots.items.menuItem',
                'kots.items.modifiers.modifier',
                'kots.items.voidedBy',
                'diningTable',
                'waiter'
            ]);
            event(new \App\Events\OrderCreated($order));
            event(new \App\Events\OrderStatusUpdated($order));
            if ($order->dining_table_id) {
                event(new \App\Events\TableStatusUpdated($order->dining_table_id, $order->business_location_id));
            }
        } catch (\Throwable $e) {
            \Log::warning('Broadcast failed in cancelOrderItem: ' . $e->getMessage());
        }

        return back()->with('success', 'Item voided successfully' . ($isWasted ? ' (logged as kitchen wastage).' : ' and inventory restored.'));
    }
}

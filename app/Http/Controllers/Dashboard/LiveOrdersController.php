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

        // Fetch orders that are either created today OR their kitchen_status is not 'ready'/'rejected' (meaning they are active)
        $orders = Order::with(['items.menuItem', 'items.modifiers.modifier', 'cashier'])
            ->when($locationId, fn($q) => $q->where('business_location_id', $locationId))
            ->where(function ($query) {
                $query->whereDate('created_at', Carbon::today())
                      ->orWhereIn('kitchen_status', ['pending', 'preparing']);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('menu-pos/live-orders/index', [
            'orders' => $orders
        ]);
    }

    public function cancelOrder(Request $request, Order $order)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:255',
            'is_wasted' => 'boolean'
        ]);
        
        $isWasted = $validated['is_wasted'] ?? false;

        if ($order->status === 'cancelled') {
            return back()->withErrors(['error' => 'Order is already cancelled.']);
        }

        // 1. Update statuses
        $order->update([
            'status' => 'cancelled',
            'kitchen_status' => 'rejected',
            'rejection_reason' => $validated['reason']
        ]);

        // Sync all KOT rounds
        \App\Models\PosKot::where('pos_order_id', $order->id)->update([
            'status' => 'rejected'
        ]);

        // 2. Revert Inventory
        \App\Services\InventoryDeductionService::revertOrder($order, $isWasted);

        // 3. Inform KDS
        event(new \App\Events\OrderCreated($order));

        return back()->with('success', 'Order cancelled successfully and inventory restored.');
    }

    public function cancelOrderItem(Request $request, \App\Models\OrderItem $item)
    {
        $validated = $request->validate([
            'is_wasted' => 'boolean'
        ]);
        $isWasted = $validated['is_wasted'] ?? false;
        
        $order = $item->order;

        if ($order->status === 'cancelled') {
            return back()->withErrors(['error' => 'Order is already cancelled.']);
        }

        // 1. Revert Inventory for this item
        \App\Services\InventoryDeductionService::revertOrderItem($item, $isWasted);

        // 2. Adjust Order Totals
        $order->subtotal = max(0, $order->subtotal - $item->subtotal);
        $order->grand_total = max(0, $order->grand_total - $item->subtotal);
        $order->save();

        // 3. Delete matching KOT item (find first match in order's KOTs)
        $kots = \App\Models\PosKot::where('pos_order_id', $order->id)->get();
        foreach ($kots as $kot) {
            $kotItem = \App\Models\PosKotItem::where('pos_kot_id', $kot->id)
                ->where('menu_item_id', $item->menu_item_id)
                ->where('quantity', $item->quantity)
                ->first();
                
            if ($kotItem) {
                $kotItem->delete();
                break;
            }
        }

        // 4. Delete the order item
        $item->delete();

        // 5. If no items left, cancel the entire order
        if ($order->items()->count() === 0) {
            $order->update([
                'status' => 'cancelled',
                'kitchen_status' => 'rejected',
                'rejection_reason' => 'All items cancelled'
            ]);
            \App\Models\PosKot::where('pos_order_id', $order->id)->update(['status' => 'rejected']);
        }

        // 6. Inform KDS
        event(new \App\Events\OrderCreated($order));

        return back()->with('success', 'Item cancelled successfully and inventory restored.');
    }
}

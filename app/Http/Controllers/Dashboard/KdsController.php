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
            ? session('active_location_id', \App\Models\BusinessLocation::first()?->id ?? 1) 
            : auth()->user()->business_location_id;

        $orders = Order::with(['items.menuItem', 'items.modifiers.modifier'])
            ->where('business_location_id', $locationId)
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

        return back()->with('success', 'Order status updated.');
    }
}

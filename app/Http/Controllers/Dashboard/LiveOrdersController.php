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
            ? session('active_location_id', \App\Models\BusinessLocation::first()?->id ?? 1) 
            : auth()->user()->business_location_id;

        // Fetch orders that are either created today OR their kitchen_status is not 'ready'/'rejected' (meaning they are active)
        $orders = Order::with(['items.menuItem', 'items.modifiers.modifier', 'cashier'])
            ->where('business_location_id', $locationId)
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
}

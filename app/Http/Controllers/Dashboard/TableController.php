<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\DiningZone;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TableController extends Controller
{
    public function index(Request $request)
    {
        $locationId = auth()->user()->hasRole('admin') 
            ? session('active_location_id', \App\Models\BusinessLocation::first()?->id ?? 1) 
            : auth()->user()->business_location_id;

        $zones = DiningZone::with(['tables' => function ($query) {
            $query->with('activeOrder.items');
        }])->where('business_location_id', $locationId)->get();

        return Inertia::render('menu-pos/tables/index', [
            'zones' => $zones
        ]);
    }
}

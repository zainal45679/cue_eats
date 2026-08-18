<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\DiningZone;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\DiningTable;

class TableController extends Controller
{
    public function index(Request $request)
    {
        $locationId = auth()->user()->hasRole('admin') 
            ? session('active_location_id', \App\Models\BusinessLocation::first()?->id ?? 1) 
            : auth()->user()->business_location_id;

        $zones = DiningZone::with(['tables' => function ($query) {
            $query->with(['activeOrder.items', 'activeOrder.waiter']);
        }])->where('business_location_id', $locationId)->get();

        return Inertia::render('menu-pos/tables/index', [
            'zones' => $zones
        ]);
    }

    public function storeZone(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $locationId = auth()->user()->hasRole('admin') 
            ? session('active_location_id', \App\Models\BusinessLocation::first()?->id) 
            : auth()->user()->business_location_id;

        DiningZone::create([
            'business_location_id' => $locationId,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        return back()->with('success', 'Dining Zone created successfully.');
    }

    public function updateZone(Request $request, DiningZone $zone)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $zone->update($validated);

        return back()->with('success', 'Dining Zone updated successfully.');
    }

    public function destroyZone(DiningZone $zone)
    {
        // Safety check: Prevent deleting zone if active orders exist in its tables
        $hasActiveOrders = $zone->tables()->whereHas('activeOrder')->exists();
        if ($hasActiveOrders) {
            return back()->withErrors(['error' => 'Cannot delete zone with active table orders.']);
        }

        $zone->delete();

        return back()->with('success', 'Dining Zone deleted successfully.');
    }

    public function storeTable(Request $request)
    {
        $validated = $request->validate([
            'dining_zone_id' => 'required|exists:dining_zones,id',
            'name' => 'required|string|max:255',
            'seating_capacity' => 'required|integer|min:1|max:50',
        ]);

        DiningTable::create([
            'dining_zone_id' => $validated['dining_zone_id'],
            'name' => $validated['name'],
            'seating_capacity' => $validated['seating_capacity'],
            'status' => 'available',
        ]);

        return back()->with('success', 'Dining Table created successfully.');
    }

    public function updateTable(Request $request, DiningTable $table)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'seating_capacity' => 'required|integer|min:1|max:50',
            'dining_zone_id' => 'nullable|exists:dining_zones,id',
        ]);

        $table->update(array_filter($validated));

        return back()->with('success', 'Dining Table updated successfully.');
    }

    public function destroyTable(DiningTable $table)
    {
        if ($table->activeOrder()->exists()) {
            return back()->withErrors(['error' => 'Cannot delete table with an active order.']);
        }

        $table->delete();

        return back()->with('success', 'Dining Table deleted successfully.');
    }
}

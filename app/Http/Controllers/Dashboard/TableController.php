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
        $query = DiningZone::with(['tables' => function ($q) {
            $q->with(['activeOrder.items', 'activeOrder.waiter', 'children']);
        }]);

        if (auth()->user()->hasRole('admin')) {
            if (session('active_location_id')) {
                $query->where('business_location_id', session('active_location_id'));
            }
            // If active_location_id is null (All Outlets mode), don't filter by location
        } else {
            $query->where('business_location_id', auth()->user()->business_location_id);
        }

        $zones = $query->get();

        // Process tables to hide children and append their names/capacities to the parent
        $zones->transform(function ($zone) {
            $parentTables = $zone->tables->filter(function ($table) {
                return $table->parent_table_id === null;
            })->values();

            $parentTables->transform(function ($table) {
                if ($table->children && $table->children->count() > 0) {
                    $table->is_merged = true;
                    $table->merged_children_ids = $table->children->pluck('id');
                    $table->original_name = $table->name;
                    $table->original_capacity = $table->seating_capacity;
                    
                    $childNames = $table->children->pluck('name')->implode(' + ');
                    $childCapacity = $table->children->sum('seating_capacity');
                    
                    $table->name = $table->name . ' + ' . $childNames;
                    $table->seating_capacity += $childCapacity;
                }
                return $table;
            });

            $zone->setRelation('tables', $parentTables);
            return $zone;
        });

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

    public function merge(Request $request)
    {
        $request->validate([
            'table_ids' => 'required|array|min:2',
            'table_ids.*' => 'exists:dining_tables,id'
        ]);

        $tableIds = $request->table_ids;
        $parentTableId = array_shift($tableIds); // The first table becomes the parent

        \App\Models\DiningTable::whereIn('id', $tableIds)->update(['parent_table_id' => $parentTableId]);

        $parentTable = \App\Models\DiningTable::find($parentTableId);
        if ($parentTable) {
            $locationId = $parentTable->diningZone?->business_location_id ?? 1;
            event(new \App\Events\TableStatusUpdated($parentTableId, $locationId));
        }

        return back()->with('success', 'Tables merged successfully.');
    }

    public function unmerge(Request $request)
    {
        $request->validate([
            'parent_table_id' => 'required|exists:dining_tables,id'
        ]);

        $parentTable = \App\Models\DiningTable::find($request->parent_table_id);
        \App\Models\DiningTable::where('parent_table_id', $request->parent_table_id)->update(['parent_table_id' => null]);

        if ($parentTable) {
            $locationId = $parentTable->diningZone?->business_location_id ?? 1;
            event(new \App\Events\TableStatusUpdated($parentTable->id, $locationId));
        }

        return back()->with('success', 'Tables unmerged successfully.');
    }
}

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
            $q->with(['activeOrder.items.menuItem', 'activeOrder.waiter', 'activeOrder.location', 'children']);
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

                    // If parent activeOrder is missing, check if any child table holds the active order
                    if (!$table->activeOrder) {
                        foreach ($table->children as $child) {
                            if ($child->activeOrder) {
                                $table->setRelation('activeOrder', $child->activeOrder);
                                break;
                            }
                        }
                    }
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
            'description' => 'nullable|string',
            'business_location_id' => 'nullable|exists:business_locations,id'
        ]);

        $locationId = $validated['business_location_id'] ?? auth()->user()->business_location_id;
        if (!$locationId && auth()->user()->hasRole('admin')) {
            $locationId = session('active_location_id', \App\Models\BusinessLocation::first()?->id);
        }

        DiningZone::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'business_location_id' => $locationId,
        ]);

        return back()->with('success', 'Dining Zone created successfully.');
    }

    public function updateZone(Request $request, DiningZone $zone)
    {
        $this->authorizeZoneAccess($zone);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $zone->update($validated);

        return back()->with('success', 'Dining Zone updated successfully.');
    }

    public function destroyZone(DiningZone $zone)
    {
        $this->authorizeZoneAccess($zone);

        // Check if any table in this zone has active orders
        $hasActiveOrders = $zone->tables()->whereHas('orders', function ($q) {
            $q->whereIn('status', ['draft', 'running', 'billed']);
        })->exists();

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

        $zone = DiningZone::findOrFail($validated['dining_zone_id']);
        $this->authorizeZoneAccess($zone);

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
        $this->authorizeTableAccess($table);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'seating_capacity' => 'required|integer|min:1|max:50',
            'dining_zone_id' => 'nullable|exists:dining_zones,id',
        ]);

        if (! empty($validated['dining_zone_id'])) {
            $this->authorizeZoneAccess(DiningZone::findOrFail($validated['dining_zone_id']));
        }

        $table->update(array_filter($validated));

        return back()->with('success', 'Dining Table updated successfully.');
    }

    public function destroyTable(DiningTable $table)
    {
        $this->authorizeTableAccess($table);

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

        $tables = DiningTable::with(['zone', 'activeOrder', 'children'])->whereIn('id', $request->table_ids)->get();
        abort_unless($tables->count() === count($request->table_ids), 422, 'One or more tables were not found.');
        $tables->each(fn (DiningTable $table) => $this->authorizeTableAccess($table));
        abort_if($tables->pluck('zone.business_location_id')->unique()->count() !== 1, 422, 'Tables must belong to the same outlet.');

        // Check if multiple tables have active orders
        $tablesWithOrders = $tables->filter(fn ($t) => $t->activeOrder !== null);
        if ($tablesWithOrders->count() > 1) {
            return back()->withErrors([
                'error' => 'Cannot merge tables: Multiple selected tables have active orders. Please settle or cancel extra orders before merging.'
            ]);
        }

        // Determine parent table: If one table has an active order, it must be the parent.
        // Otherwise, the first table selected becomes the parent.
        if ($tablesWithOrders->count() === 1) {
            $parentTable = $tablesWithOrders->first();
            $parentTableId = $parentTable->id;
        } else {
            $parentTableId = $request->table_ids[0];
            $parentTable = $tables->firstWhere('id', $parentTableId);
        }

        $childTableIds = array_values(array_diff($request->table_ids, [$parentTableId]));

        // Re-parent any existing children of the tables being merged to the new parent
        \App\Models\DiningTable::whereIn('parent_table_id', $request->table_ids)
            ->where('id', '!=', $parentTableId)
            ->update(['parent_table_id' => $parentTableId]);

        // Reassign any active orders on child tables to the parent table
        \App\Models\Order::whereIn('dining_table_id', $childTableIds)
            ->whereIn('status', ['draft', 'running', 'billed'])
            ->update(['dining_table_id' => $parentTableId]);

        // Set child tables' parent_table_id
        \App\Models\DiningTable::whereIn('id', $childTableIds)->update([
            'parent_table_id' => $parentTableId,
            'status' => 'occupied'
        ]);

        // Ensure parent table has parent_table_id = null
        $parentTable->parent_table_id = null;
        if ($parentTable->activeOrder()->exists()) {
            $orderStatus = $parentTable->activeOrder->status;
            $parentTable->status = $orderStatus === 'billed' ? 'billed' : 'occupied';
        } else {
            $parentTable->status = 'available';
        }
        $parentTable->save();

        $locationId = $parentTable->zone?->business_location_id;
        if ($locationId) {
            try {
                event(new \App\Events\TableStatusUpdated($parentTableId, $locationId));
                foreach ($childTableIds as $cId) {
                    event(new \App\Events\TableStatusUpdated($cId, $locationId));
                }
            } catch (\Throwable $e) {
                \Log::warning('Broadcast failed for TableStatusUpdated: ' . $e->getMessage());
            }
        }

        return back()->with('success', 'Tables merged successfully.');
    }

    public function unmerge(Request $request)
    {
        $request->validate([
            'parent_table_id' => 'required|exists:dining_tables,id'
        ]);

        $table = DiningTable::with(['children', 'zone'])->find($request->parent_table_id);
        $this->authorizeTableAccess($table);

        // If the provided table is actually a child, resolve its parent
        $parentTable = $table->parent_table_id ? DiningTable::with(['children', 'zone'])->find($table->parent_table_id) : $table;

        if (!$parentTable) {
            return back()->withErrors(['error' => 'Parent table not found.']);
        }

        $childTableIds = $parentTable->children->pluck('id')->toArray();

        // Unmerge all children and reset their status to available
        \App\Models\DiningTable::where('parent_table_id', $parentTable->id)->update([
            'parent_table_id' => null,
            'status' => 'available'
        ]);

        // If parent table has no active order, reset its status to available
        if (!$parentTable->activeOrder()->exists()) {
            $parentTable->status = 'available';
            $parentTable->save();
        }

        $locationId = $parentTable->zone?->business_location_id;
        if ($locationId) {
            try {
                event(new \App\Events\TableStatusUpdated($parentTable->id, $locationId));
                foreach ($childTableIds as $cId) {
                    event(new \App\Events\TableStatusUpdated($cId, $locationId));
                }
            } catch (\Throwable $e) {
                \Log::warning('Broadcast failed for TableStatusUpdated: ' . $e->getMessage());
            }
        }

        return back()->with('success', 'Tables unmerged successfully.');
    }

    private function authorizeZoneAccess(DiningZone $zone): void
    {
        $user = auth()->user();

        abort_if(
            ! $user->hasRole('admin') && $user->business_location_id !== $zone->business_location_id,
            403,
            'You are not authorized to manage tables for this outlet.'
        );
    }

    private function authorizeTableAccess(DiningTable $table): void
    {
        $table->loadMissing('zone');
        abort_if(! $table->zone, 422, 'The table is not assigned to a dining zone.');
        $this->authorizeZoneAccess($table->zone);
    }
}

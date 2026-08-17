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
            $query->with(['activeOrder.items', 'activeOrder.waiter', 'children']);
        }])->where('business_location_id', $locationId)->get();

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

    public function merge(Request $request)
    {
        $request->validate([
            'table_ids' => 'required|array|min:2',
            'table_ids.*' => 'exists:dining_tables,id'
        ]);

        $tableIds = $request->table_ids;
        $parentTableId = array_shift($tableIds); // The first table becomes the parent

        \App\Models\DiningTable::whereIn('id', $tableIds)->update(['parent_table_id' => $parentTableId]);

        return back()->with('success', 'Tables merged successfully.');
    }

    public function unmerge(Request $request)
    {
        $request->validate([
            'parent_table_id' => 'required|exists:dining_tables,id'
        ]);

        \App\Models\DiningTable::where('parent_table_id', $request->parent_table_id)->update(['parent_table_id' => null]);

        return back()->with('success', 'Tables unmerged successfully.');
    }
}

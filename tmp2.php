<?php

// 1. Merge duplicate InventoryBalance records for the same exact location
$badRecords = \App\Models\InventoryBalance::select('ingredient_id', 'storage_location_id', \Illuminate\Support\Facades\DB::raw('count(*) as c'))
    ->groupBy('ingredient_id', 'storage_location_id')
    ->having('c', '>', 1)
    ->get();

foreach ($badRecords as $bad) {
    $dupes = \App\Models\InventoryBalance::where('ingredient_id', $bad->ingredient_id)
        ->where('storage_location_id', $bad->storage_location_id)
        ->orderBy('id', 'desc')
        ->get();
        
    $keep = $dupes->first();
    $dupes->shift();
    
    foreach ($dupes as $d) {
        $keep->available_qty += $d->available_qty;
        $keep->reserved_qty += $d->reserved_qty;
        $keep->on_order_qty += $d->on_order_qty;
        $d->delete();
    }
    $keep->save();
}

// 2. Merge Duplicate Storage Locations
$locations = \App\Models\BusinessLocation::all();
foreach ($locations as $loc) {
    $stores = \App\Models\StorageLocation::where('business_location_id', $loc->id)
        ->where('storage_name', 'Main Store')
        ->orderBy('id', 'asc')
        ->get();
        
    if ($stores->count() > 1) {
        $keepStore = $stores->first();
        $stores->shift();
        
        foreach ($stores as $s) {
            // Find balances for the store we are deleting
            $balancesToMove = \App\Models\InventoryBalance::where('storage_location_id', $s->id)->get();
            
            foreach ($balancesToMove as $b) {
                // Check if the keepStore already has a balance for this ingredient
                $existing = \App\Models\InventoryBalance::where('storage_location_id', $keepStore->id)
                    ->where('ingredient_id', $b->ingredient_id)
                    ->first();
                    
                if ($existing) {
                    // Merge quantities
                    $existing->available_qty += $b->available_qty;
                    $existing->reserved_qty += $b->reserved_qty;
                    $existing->on_order_qty += $b->on_order_qty;
                    $existing->save();
                    $b->delete();
                } else {
                    // Just move it
                    $b->storage_location_id = $keepStore->id;
                    $b->save();
                }
            }
            
            $s->delete();
        }
    }
}

echo "Fixed duplicates.\n";

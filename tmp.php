<?php

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
            \App\Models\InventoryBalance::where('storage_location_id', $s->id)
                ->update(['storage_location_id' => $keepStore->id]);
            $s->delete();
        }
    }
}

// Second pass to merge balances now that storage locations are merged
$badRecords2 = \App\Models\InventoryBalance::select('ingredient_id', 'storage_location_id', \Illuminate\Support\Facades\DB::raw('count(*) as c'))
    ->groupBy('ingredient_id', 'storage_location_id')
    ->having('c', '>', 1)
    ->get();

foreach ($badRecords2 as $bad) {
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

echo "Fixed duplicates.\n";

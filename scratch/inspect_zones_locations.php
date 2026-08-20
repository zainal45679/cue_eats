<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\BusinessLocation;
use App\Models\DiningZone;
use App\Models\DiningTable;

$locations = BusinessLocation::all();
echo "Total Business Locations: " . $locations->count() . "\n";
foreach ($locations as $loc) {
    echo "Location: {$loc->id} | {$loc->location_name}\n";
    $zones = DiningZone::where('business_location_id', $loc->id)->with('tables')->get();
    foreach ($zones as $zone) {
        echo "  - Zone: {$zone->name} (ID: {$zone->id}) | Tables count: " . $zone->tables->count() . "\n";
        foreach ($zone->tables as $tbl) {
            echo "      * Table: {$tbl->name} (ID: {$tbl->id})\n";
        }
    }
}

<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\DiningTable;
use App\Models\DiningZone;

$tables = DiningTable::with('zone')->get();

echo "Total tables in DB: " . $tables->count() . "\n\n";

foreach ($tables as $t) {
    echo "ID: {$t->id} | Name: {$t->name} | Zone ID: {$t->dining_zone_id} | Zone Name: " . ($t->zone ? $t->zone->name : 'N/A') . " | Created: {$t->created_at}\n";
}

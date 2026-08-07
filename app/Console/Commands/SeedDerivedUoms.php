<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\UnitOfMeasure;
use Illuminate\Support\Str;

class SeedDerivedUoms extends Command
{
    protected $signature = 'seed:derived-uoms';
    protected $description = 'Seed derived Units of Measure (e.g., KG, L)';

    public function handle()
    {
        $gram = UnitOfMeasure::where('code', 'G')->first();
        $ml = UnitOfMeasure::where('code', 'ML')->first();
        $each = UnitOfMeasure::where('code', 'EA')->first();

        if ($gram) {
            UnitOfMeasure::firstOrCreate(
                ['code' => 'KG'],
                [
                    'name' => 'Kilogram',
                    'type' => 'Weight',
                    'base_unit_id' => $gram->id,
                    'conversion_factor' => 1000,
                    'status' => true,
                    'uuid' => (string) Str::uuid()
                ]
            );
        }

        if ($ml) {
            UnitOfMeasure::firstOrCreate(
                ['code' => 'L'],
                [
                    'name' => 'Litre',
                    'type' => 'Volume',
                    'base_unit_id' => $ml->id,
                    'conversion_factor' => 1000,
                    'status' => true,
                    'uuid' => (string) Str::uuid()
                ]
            );
        }

        if ($each) {
            UnitOfMeasure::firstOrCreate(
                ['code' => 'BX'],
                [
                    'name' => 'Box (10x)',
                    'type' => 'Unit',
                    'base_unit_id' => $each->id,
                    'conversion_factor' => 10,
                    'status' => true,
                    'uuid' => (string) Str::uuid()
                ]
            );
            
            UnitOfMeasure::firstOrCreate(
                ['code' => 'CS'],
                [
                    'name' => 'Case (24x)',
                    'type' => 'Unit',
                    'base_unit_id' => $each->id,
                    'conversion_factor' => 24,
                    'status' => true,
                    'uuid' => (string) Str::uuid()
                ]
            );
        }

        $this->info('Derived UOMs (KG, L, Box, Case) have been seeded successfully.');
    }
}

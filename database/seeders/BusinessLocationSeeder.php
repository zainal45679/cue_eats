<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BusinessLocation;
use App\Models\Country;
use App\Models\CurrencyTax;

class BusinessLocationSeeder extends Seeder
{
    public function run(): void
    {
        $country = Country::firstOrCreate(['name' => 'United Arab Emirates']);
        $tax = CurrencyTax::firstOrCreate([
            'country_id' => $country->id,
            'currency' => 'AED',
            'tax_type' => 'VAT',
        ], ['tax_percentage' => 5.00]);

        $hq = BusinessLocation::firstOrCreate(
            ['location_code' => 'HQ-001'],
            [
                'location_name' => 'Central Kitchen & HQ',
                'location_type' => 'central_kitchen',
                'country_id' => $country->id,
                'currency_tax_id' => $tax->id,
                'is_parent_location' => true,
                'is_inventory_location' => true,
                'is_purchasing_enabled' => true,
                'is_sales_enabled' => false,
                'status' => true,
            ]
        );

        BusinessLocation::firstOrCreate(
            ['location_code' => 'OUT-001'],
            [
                'parent_location_id' => $hq->id,
                'location_name' => 'Downtown Outlet 1',
                'location_type' => 'outlet',
                'country_id' => $country->id,
                'currency_tax_id' => $tax->id,
                'is_parent_location' => false,
                'is_inventory_location' => true,
                'is_purchasing_enabled' => true,
                'is_sales_enabled' => true,
                'status' => true,
            ]
        );

        BusinessLocation::firstOrCreate(
            ['location_code' => 'OUT-002'],
            [
                'parent_location_id' => $hq->id,
                'location_name' => 'Marina Outlet 2',
                'location_type' => 'outlet',
                'country_id' => $country->id,
                'currency_tax_id' => $tax->id,
                'is_parent_location' => false,
                'is_inventory_location' => true,
                'is_purchasing_enabled' => true,
                'is_sales_enabled' => true,
                'status' => true,
            ]
        );

        BusinessLocation::firstOrCreate(
            ['location_code' => 'OUT-003'],
            [
                'parent_location_id' => $hq->id,
                'location_name' => 'Mall Outlet 3',
                'location_type' => 'outlet',
                'country_id' => $country->id,
                'currency_tax_id' => $tax->id,
                'is_parent_location' => false,
                'is_inventory_location' => true,
                'is_purchasing_enabled' => true,
                'is_sales_enabled' => true,
                'status' => true,
            ]
        );
    }
}

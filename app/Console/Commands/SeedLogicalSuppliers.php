<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Supplier;
use App\Models\Ingredient;
use App\Models\IngredientSupplier;
use App\Models\CurrencyTax;

class SeedLogicalSuppliers extends Command
{
    protected $signature = 'seed:logical-suppliers';
    protected $description = 'Seed logical suppliers and map ingredients to them.';

    public function handle()
    {
        $this->info('Creating logical suppliers...');

        $suppliers = [
            'Meat' => Supplier::firstOrCreate(['name' => 'Prime Meats Co.'], ['contact_name' => 'John Butcher', 'email' => 'orders@primemeats.com', 'phone' => '555-1001', 'status' => 1]),
            'Produce' => Supplier::firstOrCreate(['name' => 'Fresh Farm Produce'], ['contact_name' => 'Sarah Green', 'email' => 'sales@freshfarm.com', 'phone' => '555-1002', 'status' => 1]),
            'Bakery' => Supplier::firstOrCreate(['name' => 'City Bakery Supplies'], ['contact_name' => 'Tom Baker', 'email' => 'b2b@citybakery.com', 'phone' => '555-1003', 'status' => 1]),
            'Beverages' => Supplier::firstOrCreate(['name' => 'Global Beverages Inc.'], ['contact_name' => 'Alice Waters', 'email' => 'supply@globalbev.com', 'phone' => '555-1004', 'status' => 1]),
            'General' => Supplier::firstOrCreate(['name' => 'General Pantry & Dairy'], ['contact_name' => 'Mike Stock', 'email' => 'orders@generalpantry.com', 'phone' => '555-1005', 'status' => 1]),
        ];

        $ingredients = Ingredient::with('category')->get();
        $tax = CurrencyTax::first();

        $this->info('Mapping ingredients to suppliers...');
        foreach ($ingredients as $ingredient) {
            $catName = strtolower($ingredient->category ? $ingredient->category->name : '');
            
            if (str_contains($catName, 'meat') || str_contains($catName, 'beef') || str_contains($catName, 'chicken')) {
                $supplier = $suppliers['Meat'];
            } elseif (str_contains($catName, 'veg') || str_contains($catName, 'fruit') || str_contains($catName, 'produce')) {
                $supplier = $suppliers['Produce'];
            } elseif (str_contains($catName, 'baker') || str_contains($catName, 'bread') || str_contains($catName, 'bun') || str_contains($catName, 'dough')) {
                $supplier = $suppliers['Bakery'];
            } elseif (str_contains($catName, 'bev') || str_contains($catName, 'drink') || str_contains($catName, 'soda') || str_contains($catName, 'syrup')) {
                $supplier = $suppliers['Beverages'];
            } else {
                $supplier = $suppliers['General'];
            }

            IngredientSupplier::updateOrCreate(
                ['ingredient_id' => $ingredient->id, 'supplier_id' => $supplier->id],
                [
                    'purchase_uom_id' => $ingredient->base_uom_id,
                    'moq' => rand(10, 50),
                    'price' => rand(5, 50) + (rand(0, 99) / 100),
                    'currency_tax_id' => $tax ? $tax->id : null,
                    'lead_time_days' => rand(1, 7),
                    'is_preferred' => true,
                    'status' => 1,
                ]
            );
        }

        $this->info('Successfully seeded logical suppliers and mapped all ingredients!');
    }
}

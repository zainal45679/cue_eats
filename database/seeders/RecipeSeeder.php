<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ingredient;
use App\Models\IngredientCategory;
use App\Models\UnitOfMeasure;
use App\Models\StorageLocation;
use App\Models\BusinessLocation;
use App\Models\InventoryBalance;
use App\Models\MenuItem;
use App\Models\RecipeItem;
use Illuminate\Support\Str;

class RecipeSeeder extends Seeder
{
    public function run()
    {
        // 1. Storage Location
        // 1. Storage Location
        $businessLoc = BusinessLocation::first();
        if (!$businessLoc) {
            \Illuminate\Support\Facades\DB::table('countries')->insertOrIgnore([
                'id' => 1, 'name' => 'United States', 'uuid' => Str::uuid(), 'created_at' => now(), 'updated_at' => now()
            ]);
            \Illuminate\Support\Facades\DB::table('currency_taxes')->insertOrIgnore([
                'id' => 1, 'country_id' => 1, 'currency' => 'USD', 'tax_type' => 'VAT', 'tax_percentage' => 0, 'uuid' => Str::uuid(), 'created_at' => now(), 'updated_at' => now()
            ]);
            \Illuminate\Support\Facades\DB::table('business_locations')->insertOrIgnore([
                'id' => 1, 'country_id' => 1, 'currency_tax_id' => 1, 'location_name' => 'Main Store', 'location_code' => 'MAIN', 'location_type' => 'Store', 'uuid' => Str::uuid(), 'created_at' => now(), 'updated_at' => now()
            ]);
            $businessLoc = BusinessLocation::find(1);
        }

        $storageLoc = StorageLocation::where('business_location_id', $businessLoc->id)->first();
        if (!$storageLoc) {
            \Illuminate\Support\Facades\DB::table('storage_locations')->insertOrIgnore([
                'id' => 1, 'business_location_id' => $businessLoc->id, 'storage_name' => 'Main Kitchen', 'storage_type' => 'Internal', 'uuid' => Str::uuid(), 'created_at' => now(), 'updated_at' => now()
            ]);
            $storageLoc = StorageLocation::find(1);
        }

        // 2. Unit of Measures
        $uomEach = UnitOfMeasure::firstOrCreate(['code' => 'EA'], ['name' => 'Each', 'type' => 'Unit', 'status' => true]);
        $uomGram = UnitOfMeasure::firstOrCreate(['code' => 'G'], ['name' => 'Gram', 'type' => 'Weight', 'status' => true]);

        // 3. Ingredient Category
        $catMeat = IngredientCategory::firstOrCreate(['name' => 'Meat'], ['status' => true]);
        $catBread = IngredientCategory::firstOrCreate(['name' => 'Bakery'], ['status' => true]);
        $catDairy = IngredientCategory::firstOrCreate(['name' => 'Dairy'], ['status' => true]);

        // 4. Ingredients
        $beefPatty = Ingredient::firstOrCreate(
            ['name' => 'Beef Patty 150g'],
            ['code' => 'BEEF150', 'ingredient_category_id' => $catMeat->id, 'base_uom_id' => $uomEach->id, 'is_inventory_item' => true, 'is_recipe_item' => true, 'status' => true]
        );
        $burgerBun = Ingredient::firstOrCreate(
            ['name' => 'Brioche Bun'],
            ['code' => 'BUN1', 'ingredient_category_id' => $catBread->id, 'base_uom_id' => $uomEach->id, 'is_inventory_item' => true, 'is_recipe_item' => true, 'status' => true]
        );
        $cheeseSlice = Ingredient::firstOrCreate(
            ['name' => 'Cheddar Cheese Slice'],
            ['code' => 'CHS1', 'ingredient_category_id' => $catDairy->id, 'base_uom_id' => $uomEach->id, 'is_inventory_item' => true, 'is_recipe_item' => true, 'status' => true]
        );

        // 5. Initial Inventory Balances
        InventoryBalance::firstOrCreate(
            ['ingredient_id' => $beefPatty->id, 'storage_location_id' => $storageLoc->id],
            ['available_qty' => 100, 'reserved_qty' => 0, 'on_order_qty' => 0]
        )->update(['available_qty' => 100]); // Reset to 100 for testing

        InventoryBalance::firstOrCreate(
            ['ingredient_id' => $burgerBun->id, 'storage_location_id' => $storageLoc->id],
            ['available_qty' => 100, 'reserved_qty' => 0, 'on_order_qty' => 0]
        )->update(['available_qty' => 100]);

        InventoryBalance::firstOrCreate(
            ['ingredient_id' => $cheeseSlice->id, 'storage_location_id' => $storageLoc->id],
            ['available_qty' => 200, 'reserved_qty' => 0, 'on_order_qty' => 0]
        )->update(['available_qty' => 200]);

        // 6. Map to MenuItem "The Classic Smash (Testing)" (ID: 1)
        $classicSmash = MenuItem::find(1);
        if ($classicSmash) {
            RecipeItem::firstOrCreate([
                'menu_item_id' => $classicSmash->id,
                'ingredient_id' => $burgerBun->id,
            ], [
                'quantity' => 1,
                'uom_id' => $uomEach->id
            ]);

            RecipeItem::firstOrCreate([
                'menu_item_id' => $classicSmash->id,
                'ingredient_id' => $beefPatty->id,
            ], [
                'quantity' => 2, // Double patty
                'uom_id' => $uomEach->id
            ]);

            RecipeItem::firstOrCreate([
                'menu_item_id' => $classicSmash->id,
                'ingredient_id' => $cheeseSlice->id,
            ], [
                'quantity' => 2, // Double cheese
                'uom_id' => $uomEach->id
            ]);
        }
    }
}

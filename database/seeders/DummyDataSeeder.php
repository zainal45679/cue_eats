<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Country;
use App\Models\CurrencyTax;
use App\Models\UnitOfMeasure;
use App\Models\IngredientCategory;
use App\Models\Brand;
use App\Models\Supplier;
use App\Models\Ingredient;
use App\Models\IngredientSupplier;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        $country = Country::firstOrCreate(['name' => 'United Arab Emirates']);
        
        $currencyTax = CurrencyTax::firstOrCreate([
            'country_id' => $country->id,
            'currency' => 'AED',
            'tax_type' => 'VAT',
        ], ['tax_percentage' => 5.00]);

        $uomKg = UnitOfMeasure::firstOrCreate(['name' => 'Kilogram', 'code' => 'kg', 'type' => 'mass']);
        $uomL = UnitOfMeasure::firstOrCreate(['name' => 'Liter', 'code' => 'L', 'type' => 'volume']);
        $uomPcs = UnitOfMeasure::firstOrCreate(['name' => 'Pieces', 'code' => 'pcs', 'type' => 'count']);

        $catDairy = IngredientCategory::firstOrCreate(['name' => 'Dairy']);
        $catProduce = IngredientCategory::firstOrCreate(['name' => 'Produce']);
        $catMeat = IngredientCategory::firstOrCreate(['name' => 'Meat']);

        $brandLocal = Brand::firstOrCreate(['name' => 'Al Ain Farms']);
        $brandGlobal = Brand::firstOrCreate(['name' => 'Nestle']);

        $supplierFresh = Supplier::firstOrCreate(['name' => 'Fresh Foods Co', 'email' => 'fresh@example.com']);
        $supplierGlobal = Supplier::firstOrCreate(['name' => 'Global Meats Ltd', 'email' => 'meats@example.com']);

        $milk = Ingredient::firstOrCreate(['code' => 'ING-001'], [
            'name' => 'Fresh Milk',
            'ingredient_category_id' => $catDairy->id,
            'base_uom_id' => $uomL->id,
            'brand_id' => $brandLocal->id,
            'is_inventory_item' => true,
            'is_purchasable' => true,
        ]);

        $beef = Ingredient::firstOrCreate(['code' => 'ING-002'], [
            'name' => 'Wagyu Beef',
            'ingredient_category_id' => $catMeat->id,
            'base_uom_id' => $uomKg->id,
            'brand_id' => $brandGlobal->id,
            'is_inventory_item' => true,
            'is_purchasable' => true,
        ]);

        IngredientSupplier::firstOrCreate(['ingredient_id' => $milk->id, 'supplier_id' => $supplierFresh->id], [
            'purchase_uom_id' => $uomL->id,
            'moq' => 10,
            'price' => 5.50,
            'currency_tax_id' => $currencyTax->id,
            'lead_time_days' => 1,
            'is_preferred' => true,
        ]);

        IngredientSupplier::firstOrCreate(['ingredient_id' => $beef->id, 'supplier_id' => $supplierGlobal->id], [
            'purchase_uom_id' => $uomKg->id,
            'moq' => 5,
            'price' => 120.00,
            'currency_tax_id' => $currencyTax->id,
            'lead_time_days' => 3,
            'is_preferred' => true,
        ]);
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Ingredient;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\GoodsReceiptNote;
use App\Models\GoodsReceiptNoteItem;
use App\Models\InventoryBalance;
use App\Models\InventoryLedger;
use App\Models\Supplier;
use App\Models\BusinessLocation;
use App\Models\UnitOfMeasure;
use App\Models\IngredientCategory;
use App\Models\StorageLocation;
use App\Models\User;

class DummyInventorySeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        if (!$user) {
            throw new \Exception('No user found. Please seed users first.');
        }

        $uomKG = UnitOfMeasure::firstOrCreate(['code' => 'KG'], ['name' => 'Kilogram', 'type' => 'Weight', 'status' => 1]);
        $uomEA = UnitOfMeasure::firstOrCreate(['code' => 'EA'], ['name' => 'Each', 'type' => 'Unit', 'status' => 1]);
        $uomL = UnitOfMeasure::firstOrCreate(['code' => 'L'], ['name' => 'Liter', 'type' => 'Volume', 'status' => 1]);

        $catProduce = IngredientCategory::firstOrCreate(['name' => 'Produce'], ['status' => 1]);
        $catMeat = IngredientCategory::firstOrCreate(['name' => 'Meat'], ['status' => 1]);
        $catDairy = IngredientCategory::firstOrCreate(['name' => 'Dairy'], ['status' => 1]);
        $catBakery = IngredientCategory::firstOrCreate(['name' => 'Bakery'], ['status' => 1]);
        $catPantry = IngredientCategory::firstOrCreate(['name' => 'Pantry'], ['status' => 1]);
        $catFrozen = IngredientCategory::firstOrCreate(['name' => 'Frozen'], ['status' => 1]);
        $catBeverage = IngredientCategory::firstOrCreate(['name' => 'Beverage'], ['status' => 1]);

        $supplier = Supplier::firstOrCreate(['name' => 'Fresh Farms'], ['status' => 1]);
        $locations = BusinessLocation::all();

        // 1. Create Logical Ingredients
        $ingredients = [
            ['name' => 'Burger Bun', 'code' => 'BUN-01', 'cat' => $catBakery, 'uom' => $uomEA],
            ['name' => 'Beef Patty 150g', 'code' => 'BEEF-01', 'cat' => $catMeat, 'uom' => $uomEA],
            ['name' => 'American Cheese', 'code' => 'CHS-AM', 'cat' => $catDairy, 'uom' => $uomEA],
            ['name' => 'Swiss Cheese', 'code' => 'CHS-SW', 'cat' => $catDairy, 'uom' => $uomEA],
            ['name' => 'Pepper Jack Cheese', 'code' => 'CHS-PJ', 'cat' => $catDairy, 'uom' => $uomEA],
            ['name' => 'Red Onions', 'code' => 'PRO-ON', 'cat' => $catProduce, 'uom' => $uomKG],
            ['name' => 'Pickles', 'code' => 'PAN-PKL', 'cat' => $catPantry, 'uom' => $uomKG],
            ['name' => 'Wild Mushrooms', 'code' => 'PRO-MSH', 'cat' => $catProduce, 'uom' => $uomKG],
            ['name' => 'Truffle Aioli', 'code' => 'PAN-TAI', 'cat' => $catPantry, 'uom' => $uomL],
            ['name' => 'Arugula', 'code' => 'PRO-ARG', 'cat' => $catProduce, 'uom' => $uomKG],
            ['name' => 'Roasted Jalapenos', 'code' => 'PRO-JAL', 'cat' => $catProduce, 'uom' => $uomKG],
            ['name' => 'Spicy Habanero Mayo', 'code' => 'PAN-HBM', 'cat' => $catPantry, 'uom' => $uomL],
            ['name' => 'Pizza Dough Portion', 'code' => 'BKT-PZD', 'cat' => $catBakery, 'uom' => $uomEA],
            ['name' => 'San Marzano Tomato Sauce', 'code' => 'PAN-TMS', 'cat' => $catPantry, 'uom' => $uomL],
            ['name' => 'Fresh Mozzarella', 'code' => 'CHS-FMZ', 'cat' => $catDairy, 'uom' => $uomKG],
            ['name' => 'Shredded Mozzarella', 'code' => 'CHS-SMZ', 'cat' => $catDairy, 'uom' => $uomKG],
            ['name' => 'Fresh Basil', 'code' => 'PRO-BSL', 'cat' => $catProduce, 'uom' => $uomKG],
            ['name' => 'Pepperoni Slices', 'code' => 'MET-PEP', 'cat' => $catMeat, 'uom' => $uomKG],
            ['name' => 'Hot Honey', 'code' => 'PAN-HNY', 'cat' => $catPantry, 'uom' => $uomL],
            ['name' => 'Smoked BBQ Sauce', 'code' => 'PAN-BBQ', 'cat' => $catPantry, 'uom' => $uomL],
            ['name' => 'Grilled Chicken Breast', 'code' => 'MET-CHK', 'cat' => $catMeat, 'uom' => $uomKG],
            ['name' => 'Cilantro', 'code' => 'PRO-CIL', 'cat' => $catProduce, 'uom' => $uomKG],
            ['name' => 'Shoestring Fries', 'code' => 'FRZ-FRS', 'cat' => $catFrozen, 'uom' => $uomKG],
            ['name' => 'Truffle Oil', 'code' => 'PAN-TRO', 'cat' => $catPantry, 'uom' => $uomL],
            ['name' => 'Parmesan Cheese', 'code' => 'CHS-PRM', 'cat' => $catDairy, 'uom' => $uomKG],
            ['name' => 'Parsley', 'code' => 'PRO-PAR', 'cat' => $catProduce, 'uom' => $uomKG],
            ['name' => 'Mozzarella Sticks', 'code' => 'FRZ-MST', 'cat' => $catFrozen, 'uom' => $uomEA],
            ['name' => 'Marinara Sauce', 'code' => 'PAN-MAR', 'cat' => $catPantry, 'uom' => $uomL],
            ['name' => 'Beer-Battered Onion Rings', 'code' => 'FRZ-ONR', 'cat' => $catFrozen, 'uom' => $uomEA],
            ['name' => 'Craft Cola Syrup', 'code' => 'BEV-COL', 'cat' => $catBeverage, 'uom' => $uomL],
            ['name' => 'Carbonated Water', 'code' => 'BEV-CRB', 'cat' => $catBeverage, 'uom' => $uomL],
            ['name' => 'Fresh Lemon Juice', 'code' => 'PRO-LMJ', 'cat' => $catProduce, 'uom' => $uomL],
            ['name' => 'Cane Sugar', 'code' => 'PAN-SGR', 'cat' => $catPantry, 'uom' => $uomKG],
            ['name' => 'Strawberry Puree', 'code' => 'BEV-STP', 'cat' => $catBeverage, 'uom' => $uomL],
        ];

        $insertedIngredients = [];
        foreach ($ingredients as $ing) {
            $insertedIngredients[] = Ingredient::updateOrCreate(
                ['code' => $ing['code']],
                [
                    'name' => $ing['name'],
                    'ingredient_category_id' => $ing['cat']->id,
                    'base_uom_id' => $ing['uom']->id,
                    'status' => 1,
                    'is_inventory_item' => 1,
                    'is_purchasable' => 1,
                    'is_recipe_item' => 1
                ]
            );
        }

        // Top up inventory
        foreach ($locations as $location) {
            $po = PurchaseOrder::create([
                'po_number' => 'PO-' . time() . '-' . $location->id,
                'supplier_id' => $supplier->id,
                'business_location_id' => $location->id,
                'status' => 'approved',
                'expected_delivery_date' => now()->addDays(1),
                'subtotal' => 1000,
                'tax_total' => 0,
                'grand_total' => 1000,
                'created_by' => $user->id,
            ]);

            $poItems = [];
            foreach ($insertedIngredients as $ingredient) {
                $qty = rand(100, 500);
                $poItems[] = PurchaseOrderItem::create([
                    'purchase_order_id' => $po->id,
                    'ingredient_id' => $ingredient->id,
                    'purchase_uom_id' => $ingredient->base_uom_id,
                    'quantity' => $qty,
                    'received_quantity' => $qty,
                    'unit_price' => rand(2, 20),
                ]);
            }

            $grn = GoodsReceiptNote::create([
                'purchase_order_id' => $po->id,
                'grn_number' => 'GRN-' . time() . '-' . $location->id,
                'location_id' => $location->id,
                'status' => 'completed',
                'received_by_id' => $user->id,
            ]);

            $po->update(['status' => 'received']);

            $storageLocation = StorageLocation::firstOrCreate(
                ['business_location_id' => $location->id, 'storage_name' => 'Main Kitchen'],
                ['storage_type' => 'Internal', 'status' => 1]
            );

            foreach ($poItems as $poItem) {
                GoodsReceiptNoteItem::create([
                    'goods_receipt_note_id' => $grn->id,
                    'ingredient_id' => $poItem->ingredient_id,
                    'expected_quantity' => $poItem->quantity,
                    'received_quantity' => $poItem->quantity,
                    'uom_id' => $poItem->purchase_uom_id,
                ]);

                $balance = InventoryBalance::firstOrCreate(
                    ['storage_location_id' => $storageLocation->id, 'ingredient_id' => $poItem->ingredient_id],
                    ['available_qty' => 0, 'reserved_qty' => 0]
                );

                $balance->increment('available_qty', $poItem->quantity);

                InventoryLedger::create([
                    'business_location_id' => $location->id,
                    'ingredient_id' => $poItem->ingredient_id,
                    'transaction_type' => 'purchase_receive',
                    'reference_type' => GoodsReceiptNote::class,
                    'reference_id' => $grn->id,
                    'quantity' => $poItem->quantity,
                    'running_balance' => $balance->fresh()->available_qty,
                    'created_by' => $user->id,
                ]);
            }
        }
    }
}


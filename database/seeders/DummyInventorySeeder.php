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
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Truncate relevant tables
        DB::table('inventory_ledgers')->truncate();
        DB::table('inventory_balances')->truncate();
        DB::table('goods_receipt_note_items')->truncate();
        DB::table('goods_receipt_notes')->truncate();
        DB::table('purchase_order_items')->truncate();
        DB::table('purchase_orders')->truncate();
        DB::table('stock_transfer_order_items')->truncate();
        DB::table('stock_transfer_orders')->truncate();
        DB::table('internal_request_items')->truncate();
        DB::table('internal_requests')->truncate();
        DB::table('ingredients')->truncate();
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $uom = UnitOfMeasure::first() ?? UnitOfMeasure::create(['name' => 'Kilogram', 'code' => 'KG']);
        $cat = IngredientCategory::first() ?? IngredientCategory::create(['name' => 'Produce']);
        $supplier = Supplier::first() ?? Supplier::create(['name' => 'Fresh Farms', 'code' => 'SUP-001', 'status' => 1]);
        $locations = BusinessLocation::all();

        // 1. Create Dummy Ingredients
        $ingredients = [
            ['name' => 'Fresh Tomatoes', 'code' => 'ING-001', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id, 'status' => 1, 'is_inventory_item' => 1, 'is_purchasable' => 1],
            ['name' => 'Red Onions', 'code' => 'ING-002', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id, 'status' => 1, 'is_inventory_item' => 1, 'is_purchasable' => 1],
            ['name' => 'Chicken Breast', 'code' => 'ING-003', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id, 'status' => 1, 'is_inventory_item' => 1, 'is_purchasable' => 1],
            ['name' => 'Beef Patty 200g', 'code' => 'ING-004', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id, 'status' => 1, 'is_inventory_item' => 1, 'is_purchasable' => 1],
            ['name' => 'Cheddar Cheese', 'code' => 'ING-005', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id, 'status' => 1, 'is_inventory_item' => 1, 'is_purchasable' => 1],
            ['name' => 'Iceberg Lettuce', 'code' => 'ING-006', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id, 'status' => 1, 'is_inventory_item' => 1, 'is_purchasable' => 1],
            ['name' => 'Burger Buns', 'code' => 'ING-007', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id, 'status' => 1, 'is_inventory_item' => 1, 'is_purchasable' => 1],
            ['name' => 'Wheat Flour', 'code' => 'ING-008', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id, 'status' => 1, 'is_inventory_item' => 1, 'is_purchasable' => 1],
            ['name' => 'White Sugar', 'code' => 'ING-009', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id, 'status' => 1, 'is_inventory_item' => 1, 'is_purchasable' => 1],
            ['name' => 'Table Salt', 'code' => 'ING-010', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id, 'status' => 1, 'is_inventory_item' => 1, 'is_purchasable' => 1],
        ];

        $insertedIngredients = [];
        foreach ($ingredients as $ing) {
            $insertedIngredients[] = Ingredient::create($ing);
        }

        foreach ($locations as $location) {
            // 2. Create a Purchase Order
            $po = PurchaseOrder::create([
                'po_number' => 'PO-' . time() . '-' . $location->id,
                'supplier_id' => $supplier->id,
                'business_location_id' => $location->id,
                'status' => 'approved',
                'expected_delivery_date' => now()->addDays(1),
                'subtotal' => 500,
                'tax_total' => 0,
                'grand_total' => 500,
                'created_by' => $user->id ?? 1,
            ]);

            $poItems = [];
            foreach ($insertedIngredients as $index => $ingredient) {
                $qty = rand(50, 200);
                $poItems[] = PurchaseOrderItem::create([
                    'purchase_order_id' => $po->id,
                    'ingredient_id' => $ingredient->id,
                    'purchase_uom_id' => $uom->id,
                    'quantity' => $qty,
                    'received_quantity' => $qty,
                    'unit_price' => rand(10, 50),
                ]);
            }

            // 3. Create GRN and update inventory
            $grn = GoodsReceiptNote::create([
                'purchase_order_id' => $po->id,
                'grn_number' => 'GRN-' . time() . '-' . $location->id,
                'location_id' => $location->id,
                'status' => 'completed',
                'received_by_id' => $user->id ?? 1,
            ]);

            $po->update(['status' => 'fully_received']);

            $storageLocation = StorageLocation::firstOrCreate(
                [
                    'business_location_id' => $location->id,
                    'storage_name' => 'Main Store',
                ],
                [
                    'storage_type' => 'Store',
                    'status' => 1,
                ]
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
                    [
                        'storage_location_id' => $storageLocation->id,
                        'ingredient_id' => $poItem->ingredient_id,
                    ],
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
                    'created_by' => $user->id ?? 1,
                ]);
            }
        }
    }
}

<?php

declare(strict_types=1);

use App\Models\BusinessLocation;
use App\Models\Ingredient;
use App\Models\IngredientCategory;
use App\Models\InventoryBalance;
use App\Models\InventoryLedger;
use App\Models\InventoryLotBalance;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Role;
use App\Models\StorageLocation;
use App\Models\Supplier;
use App\Models\UnitOfMeasure;
use App\Models\User;

beforeEach(function () {
    $this->location = BusinessLocation::factory()->create();
    $this->user = User::factory()->create(['business_location_id' => $this->location->id]);
    $this->user->assignRole(Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']));

    $this->baseUom = UnitOfMeasure::create([
        'name' => 'Each',
        'code' => 'EA-GRN',
        'type' => 'Unit',
        'status' => true,
    ]);
    $this->purchaseUom = UnitOfMeasure::create([
        'name' => 'Case of 12',
        'code' => 'CS12-GRN',
        'type' => 'Unit',
        'base_unit_id' => $this->baseUom->id,
        'conversion_factor' => 12,
        'status' => true,
    ]);
    $category = IngredientCategory::create(['name' => 'GRN Test', 'status' => true]);
    $this->ingredient = Ingredient::create([
        'name' => 'Test Cans',
        'code' => 'GRN-CANS',
        'ingredient_category_id' => $category->id,
        'base_uom_id' => $this->baseUom->id,
        'is_inventory_item' => true,
        'is_purchasable' => true,
        'status' => true,
    ]);
    $this->supplier = Supplier::create(['name' => 'GRN Supplier', 'status' => true]);
    $this->storage = StorageLocation::create([
        'business_location_id' => $this->location->id,
        'storage_name' => 'Main Store',
        'storage_type' => 'Store',
        'status' => true,
    ]);

    $this->po = PurchaseOrder::create([
        'po_number' => 'PO-GRN-001',
        'business_location_id' => $this->location->id,
        'delivery_location_id' => $this->location->id,
        'supplier_id' => $this->supplier->id,
        'status' => 'approved',
        'created_by' => $this->user->id,
    ]);
    $this->poItem = PurchaseOrderItem::create([
        'purchase_order_id' => $this->po->id,
        'ingredient_id' => $this->ingredient->id,
        'quantity' => 10,
        'purchase_uom_id' => $this->purchaseUom->id,
        'unit_price' => 20,
    ]);
    InventoryBalance::create([
        'storage_location_id' => $this->storage->id,
        'ingredient_id' => $this->ingredient->id,
        'available_qty' => 0,
        'on_order_qty' => 120,
    ]);
});

test('purchase receipt updates aggregate stock, lot stock, ledger and remaining order quantity', function () {
    $response = $this->actingAs($this->user)->post('/purchasing/grns', [
        'po_id' => $this->po->id,
        'remarks' => 'Four cases arrived',
        'items' => [[
            'source_item_id' => $this->poItem->id,
            'ingredient_id' => $this->ingredient->id,
            'expected_quantity' => 10,
            'received_quantity' => 4,
            'rejected_quantity' => 0,
            'batch_number' => 'CASE-001',
            'mfg_date' => today()->subDay()->toDateString(),
            'expiry_date' => today()->addMonth()->toDateString(),
            'uom_id' => $this->purchaseUom->id,
        ]],
    ]);

    $response->assertSessionHasNoErrors();
    $grn = $this->po->grns()->firstOrFail();
    $response->assertRedirect(route('grns.show', $grn));

    expect((float) $this->poItem->fresh()->received_quantity)->toBe(4.0)
        ->and($this->po->fresh()->status)->toBe('partially_received');

    $balance = InventoryBalance::where('storage_location_id', $this->storage->id)
        ->where('ingredient_id', $this->ingredient->id)
        ->firstOrFail();
    expect((float) $balance->available_qty)->toBe(48.0)
        ->and((float) $balance->on_order_qty)->toBe(72.0)
        ->and((float) InventoryLotBalance::sum('available_qty'))->toBe(48.0);

    $ledger = InventoryLedger::where('reference_id', $grn->id)->firstOrFail();
    expect($ledger->storage_location_id)->toBe($this->storage->id)
        ->and((float) $ledger->quantity)->toBe(48.0);
});

test('empty receipts and source items from another order are rejected without changing stock', function () {
    $otherPo = PurchaseOrder::create([
        'po_number' => 'PO-GRN-002',
        'business_location_id' => $this->location->id,
        'delivery_location_id' => $this->location->id,
        'supplier_id' => $this->supplier->id,
        'status' => 'approved',
        'created_by' => $this->user->id,
    ]);
    $otherItem = PurchaseOrderItem::create([
        'purchase_order_id' => $otherPo->id,
        'ingredient_id' => $this->ingredient->id,
        'quantity' => 2,
        'purchase_uom_id' => $this->purchaseUom->id,
        'unit_price' => 20,
    ]);

    $response = $this->actingAs($this->user)->post('/purchasing/grns', [
        'po_id' => $this->po->id,
        'items' => [[
            'source_item_id' => $otherItem->id,
            'ingredient_id' => $this->ingredient->id,
            'expected_quantity' => 10,
            'received_quantity' => 1,
            'rejected_quantity' => 0,
            'uom_id' => $this->purchaseUom->id,
        ]],
    ]);

    $response->assertSessionHasErrors('items');
    expect($this->po->grns()->count())->toBe(0)
        ->and((float) InventoryBalance::firstOrFail()->available_qty)->toBe(0.0);
});

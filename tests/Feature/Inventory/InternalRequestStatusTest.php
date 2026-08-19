<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\BusinessLocation;
use App\Models\Ingredient;
use App\Models\UnitOfMeasure;
use App\Models\InternalRequest;
use App\Models\PurchaseOrder;
use App\Models\Supplier;

beforeEach(function () {
    $this->locationA = BusinessLocation::factory()->create(['location_name' => 'Branch A']);
    $this->locationB = BusinessLocation::factory()->create(['location_name' => 'Branch B']);
    $this->user = User::factory()->create(['business_location_id' => $this->locationA->id]);
    $this->user->assignRole(\App\Models\Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']));
    
    $this->uom = UnitOfMeasure::firstOrCreate(
        ['name' => 'Liter'],
        ['code' => 'LTR', 'type' => 'volume', 'conversion_factor' => 1]
    );
    $this->ingredient = Ingredient::firstOrCreate(['name' => 'Fresh Milk'], ['base_uom_id' => $this->uom->id]);
    $this->supplier = Supplier::firstOrCreate(['name' => 'Dairy Supplier']);
});

test('internal request and purchase order relations resolve UUID locations and users cleanly', function () {
    $this->actingAs($this->user);

    $ir = InternalRequest::create([
        'request_number' => 'REQ-TEST-100',
        'from_location_id' => $this->locationA->id,
        'to_location_id' => $this->locationB->id,
        'requested_by_id' => $this->user->id,
        'status' => 'pending_fulfillment',
    ]);

    $po = PurchaseOrder::create([
        'po_number' => 'PO-TEST-100',
        'business_location_id' => $this->locationA->id,
        'delivery_location_id' => $this->locationB->id,
        'supplier_id' => $this->supplier->id,
        'created_by' => $this->user->id,
        'status' => 'pending_approval',
    ]);

    $irFresh = InternalRequest::with(['fromLocation', 'toLocation', 'requestedBy'])->find($ir->id);
    expect($irFresh->fromLocation)->not->toBeNull()
        ->and($irFresh->fromLocation->location_name)->toBe('Branch A')
        ->and($irFresh->toLocation)->not->toBeNull()
        ->and($irFresh->toLocation->location_name)->toBe('Branch B')
        ->and($irFresh->requestedBy)->not->toBeNull()
        ->and($irFresh->requestedBy->id)->toBe($this->user->id);

    $poFresh = PurchaseOrder::with(['businessLocation', 'deliveryLocation', 'supplier'])->find($po->id);
    expect($poFresh->businessLocation)->not->toBeNull()
        ->and($poFresh->businessLocation->location_name)->toBe('Branch A')
        ->and($poFresh->deliveryLocation)->not->toBeNull()
        ->and($poFresh->deliveryLocation->location_name)->toBe('Branch B')
        ->and($poFresh->supplier)->not->toBeNull()
        ->and($poFresh->supplier->name)->toBe('Dairy Supplier');
});

test('internal request sets status to rejected when 100% of items are rejected during fulfillment', function () {
    $this->actingAs($this->user);

    $ir = InternalRequest::create([
        'request_number' => 'REQ-TEST-REJECT',
        'from_location_id' => $this->locationA->id,
        'to_location_id' => $this->locationB->id,
        'requested_by_id' => $this->user->id,
        'status' => 'pending_fulfillment',
    ]);

    $item = $ir->items()->create([
        'ingredient_id' => $this->ingredient->id,
        'quantity' => 5.00,
        'dispatched_quantity' => 0.00,
        'rejected_quantity' => 0.00,
        'uom_id' => $this->uom->id,
    ]);

    $response = $this->post("/purchasing/internal-requests/{$ir->uuid}/fulfill", [
        'items' => [
            [
                'id' => $item->id,
                'dispatch_quantity' => 0.00,
                'reject_quantity' => 5.00,
            ]
        ]
    ]);

    $response->assertSessionHasNoErrors();
    $irFresh = $ir->fresh();
    expect($irFresh->status)->toBe('rejected');
});

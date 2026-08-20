<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\BusinessLocation;
use App\Models\StorageLocation;
use App\Models\Ingredient;
use App\Models\UnitOfMeasure;
use App\Models\IngredientCategory;
use App\Models\InventoryBalance;
use App\Models\InternalRequest;
use App\Models\InternalRequestItem;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\RecipeItem;

beforeEach(function () {
    $this->location = BusinessLocation::factory()->create();
    $this->user = User::factory()->create(['business_location_id' => $this->location->id]);
    $this->user->assignRole(\App\Models\Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']));

    $this->mainStore = StorageLocation::create([
        'business_location_id' => $this->location->id,
        'storage_name' => 'Main Store',
        'storage_type' => 'Store',
        'status' => 1,
    ]);

    $this->mainKitchen = StorageLocation::create([
        'business_location_id' => $this->location->id,
        'storage_name' => 'Main Kitchen',
        'storage_type' => 'Kitchen',
        'status' => 1,
    ]);

    $uom = UnitOfMeasure::firstOrCreate(['code' => 'EA'], ['name' => 'Each', 'type' => 'Unit', 'status' => 1]);
    $cat = IngredientCategory::firstOrCreate(['name' => 'General'], ['status' => 1]);

    $this->ingredient = Ingredient::create([
        'code' => 'ING-TEST-' . rand(100, 999),
        'name' => 'Burger Bun',
        'ingredient_category_id' => $cat->id,
        'base_uom_id' => $uom->id,
        'is_inventory_item' => 1,
        'is_purchasable' => 1,
        'is_recipe_item' => 1,
    ]);
});

test('inter-storage transfer moves stock between storage locations in the same branch', function () {
    $this->actingAs($this->user);

    // Initial Balances: Main Store = 100, Main Kitchen = 200
    InventoryBalance::create(['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 100]);
    InventoryBalance::create(['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 200]);

    // Transfer 50 EA from Main Store -> Main Kitchen
    $response = $this->post('/inventory/storage-transfers', [
        'from_storage_location_id' => $this->mainStore->id,
        'to_storage_location_id' => $this->mainKitchen->id,
        'ingredient_id' => $this->ingredient->id,
        'quantity' => 50,
    ]);

    $response->assertSessionHasNoErrors();

    // Verify Main Store = 50, Main Kitchen = 250, Total = 300
    $this->assertDatabaseHas('inventory_balances', ['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 50]);
    $this->assertDatabaseHas('inventory_balances', ['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 250]);
});

test('inter-storage transfer is rejected if source stock is insufficient', function () {
    $this->actingAs($this->user);

    InventoryBalance::create(['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 10]);

    $response = $this->post('/inventory/storage-transfers', [
        'from_storage_location_id' => $this->mainStore->id,
        'to_storage_location_id' => $this->mainKitchen->id,
        'ingredient_id' => $this->ingredient->id,
        'quantity' => 20,
    ]);

    $response->assertSessionHasErrors(['quantity']);
    $this->assertDatabaseHas('inventory_balances', ['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 10]);
});

test('inter-storage transfer is rejected if source and destination are the same', function () {
    $this->actingAs($this->user);

    $response = $this->post('/inventory/storage-transfers', [
        'from_storage_location_id' => $this->mainStore->id,
        'to_storage_location_id' => $this->mainStore->id,
        'ingredient_id' => $this->ingredient->id,
        'quantity' => 10,
    ]);

    $response->assertSessionHasErrors(['to_storage_location_id']);
});

test('internal request dispatch decrements selected source storage location', function () {
    $this->actingAs($this->user);

    $destLoc = BusinessLocation::factory()->create();

    // Main Store = 0 EA, Main Kitchen = 340 EA
    InventoryBalance::create(['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 0]);
    InventoryBalance::create(['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 340]);

    $ir = InternalRequest::create([
        'request_number' => 'REQ-TEST-1',
        'from_location_id' => $this->location->id,
        'to_location_id' => $destLoc->id,
        'requested_by_id' => $this->user->id,
        'status' => 'pending_fulfillment',
    ]);

    $item = InternalRequestItem::create([
        'internal_request_id' => $ir->id,
        'ingredient_id' => $this->ingredient->id,
        'quantity' => 20,
        'uom_id' => $this->ingredient->base_uom_id,
    ]);

    // Dispatch 20 EA specifically from Main Kitchen
    $response = $this->post("/purchasing/internal-requests/{$ir->uuid}/fulfill", [
        'items' => [
            [
                'id' => $item->id,
                'dispatch_quantity' => 20,
                'reject_quantity' => 0,
                'from_storage_location_id' => $this->mainKitchen->id,
            ]
        ]
    ]);

    $response->assertSessionHasNoErrors();

    // Verify Main Kitchen = 320 EA, Main Store remains 0 EA
    $this->assertDatabaseHas('inventory_balances', ['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 320]);
    $this->assertDatabaseHas('inventory_balances', ['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 0]);
});

test('pos check-stock detects out-of-stock ingredients and cashier override allows sale', function () {
    $this->actingAs($this->user);

    $cat = MenuCategory::create(['name' => 'Burgers']);
    $menuItem = MenuItem::create([
        'menu_category_id' => $cat->id,
        'name' => 'Special Burger',
        'price' => 15.00,
        'is_active' => true,
        'is_available' => true,
    ]);

    RecipeItem::create([
        'menu_item_id' => $menuItem->id,
        'ingredient_id' => $this->ingredient->id,
        'quantity' => 1,
    ]);

    // Main Store = 0, Main Kitchen = 0
    InventoryBalance::create(['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 0]);

    // Check stock endpoint
    $response = $this->postJson('/menu-pos/terminal/check-stock', [
        'cart' => [
            [
                'menu_item_id' => $menuItem->id,
                'quantity' => 1,
            ]
        ]
    ]);

    $response->assertStatus(200);
    $response->assertJson(['is_available' => false]);

    // Checkout with allow_override = true
    $checkoutResponse = $this->post('/menu-pos/terminal/checkout', [
        'action' => 'settle',
        'payment_method' => 'Cash',
        'tendered_amount' => 20.00,
        'order_type' => 'Dine-in',
        'allow_override' => true,
        'cart' => [
            [
                'menu_item_id' => $menuItem->id,
                'quantity' => 1,
                'price' => 15.00,
            ]
        ]
    ]);

    $checkoutResponse->assertSessionHasNoErrors();
    $this->assertDatabaseHas('pos_orders', ['status' => 'Completed']);
});

test('order items deduct stock from kitchen storage when created or prepared in kds', function () {
    $this->actingAs($this->user);

    $cat = MenuCategory::create(['name' => 'Pizza']);
    $menuItem = MenuItem::create([
        'menu_category_id' => $cat->id,
        'name' => 'Cheese Pizza',
        'price' => 12.00,
        'is_active' => true,
        'is_available' => true,
    ]);

    RecipeItem::create([
        'menu_item_id' => $menuItem->id,
        'ingredient_id' => $this->ingredient->id,
        'quantity' => 2,
    ]);

    // Main Store = 0, Main Kitchen = 50
    InventoryBalance::create(['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 0]);
    InventoryBalance::create(['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 50]);

    // Save KOT from POS Terminal for 3 Cheese Pizzas (requires 6 Burger Buns)
    $response = $this->post('/menu-pos/terminal/checkout', [
        'action' => 'save_kot',
        'order_type' => 'Dine-in',
        'cart' => [
            [
                'menu_item_id' => $menuItem->id,
                'quantity' => 3,
                'price' => 12.00,
            ]
        ]
    ]);

    $response->assertSessionHasNoErrors();

    // Verify Main Kitchen stock decremented from 50 -> 44 EA
    $this->assertDatabaseHas('inventory_balances', [
        'storage_location_id' => $this->mainKitchen->id,
        'ingredient_id' => $this->ingredient->id,
        'available_qty' => 44
    ]);
});

test('case 1: Main Store = 0, Main Kitchen = 340 -> transfer 20 from Main Kitchen succeeds', function () {
    $this->actingAs($this->user);

    InventoryBalance::create(['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 0]);
    InventoryBalance::create(['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 340]);

    $response = $this->post('/inventory/storage-transfers', [
        'from_storage_location_id' => $this->mainKitchen->id,
        'to_storage_location_id' => $this->mainStore->id,
        'ingredient_id' => $this->ingredient->id,
        'quantity' => 20,
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('inventory_balances', ['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 320]);
    $this->assertDatabaseHas('inventory_balances', ['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 20]);
});

test('case 2: Main Store = 20, Main Kitchen = 0 -> transfer 20 from Main Store succeeds', function () {
    $this->actingAs($this->user);

    InventoryBalance::create(['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 20]);
    InventoryBalance::create(['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 0]);

    $response = $this->post('/inventory/storage-transfers', [
        'from_storage_location_id' => $this->mainStore->id,
        'to_storage_location_id' => $this->mainKitchen->id,
        'ingredient_id' => $this->ingredient->id,
        'quantity' => 20,
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('inventory_balances', ['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 0]);
    $this->assertDatabaseHas('inventory_balances', ['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 20]);
});

test('case 3: Main Store = 0, Main Kitchen = 20 -> reverse transfer 20 from Main Kitchen succeeds', function () {
    $this->actingAs($this->user);

    InventoryBalance::create(['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 0]);
    InventoryBalance::create(['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 20]);

    $response = $this->post('/inventory/storage-transfers', [
        'from_storage_location_id' => $this->mainKitchen->id,
        'to_storage_location_id' => $this->mainStore->id,
        'ingredient_id' => $this->ingredient->id,
        'quantity' => 20,
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('inventory_balances', ['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 0]);
    $this->assertDatabaseHas('inventory_balances', ['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 20]);
});

test('case 4: Main Store = 10, Main Kitchen = 0 -> attempting transfer 20 correctly fails', function () {
    $this->actingAs($this->user);

    InventoryBalance::create(['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 10]);
    InventoryBalance::create(['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 0]);

    $response = $this->post('/inventory/storage-transfers', [
        'from_storage_location_id' => $this->mainStore->id,
        'to_storage_location_id' => $this->mainKitchen->id,
        'ingredient_id' => $this->ingredient->id,
        'quantity' => 20,
    ]);

    $response->assertSessionHasErrors(['quantity']);
    $this->assertDatabaseHas('inventory_balances', ['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 10]);
});

test('case 5: live stock page returns allInventoryBalances payload for transfer modal regardless of table filters', function () {
    $this->actingAs($this->user);

    InventoryBalance::create(['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 0]);
    InventoryBalance::create(['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 340]);

    $response = $this->get('/inventory/live-stock');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->has('allInventoryBalances')
             ->where('allInventoryBalances.0.available_qty', 0)
             ->where('allInventoryBalances.1.available_qty', 340)
    );
});

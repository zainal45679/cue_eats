<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\BusinessLocation;
use App\Models\StorageLocation;
use App\Models\Ingredient;
use App\Models\UnitOfMeasure;
use App\Models\RecipeItem;
use App\Models\InventoryBalance;
use App\Models\Order;

beforeEach(function () {
    // Setup test data
    $this->location = BusinessLocation::factory()->create();
    $this->user = User::factory()->create(['business_location_id' => $this->location->id]);
    $this->storageLocation = StorageLocation::create([
        'business_location_id' => $this->location->id,
        'storage_name' => 'Main Store',
        'storage_type' => 'Store',
        'status' => 1
    ]);

    $uom = UnitOfMeasure::firstOrCreate(['code' => 'EA'], ['name' => 'Each', 'type' => 'Unit', 'status' => 1]);
    $category = \App\Models\IngredientCategory::firstOrCreate(['name' => 'General'], ['status' => 1]);
    
    $this->ingredient = Ingredient::create([
        'code' => 'ING-TEST-' . rand(100, 999),
        'name' => 'Test Ingredient',
        'ingredient_category_id' => $category->id,
        'base_uom_id' => $uom->id,
        'is_inventory_item' => 1,
        'is_purchasable' => 1,
        'is_recipe_item' => 1,
    ]);

    InventoryBalance::create([
        'storage_location_id' => $this->storageLocation->id,
        'ingredient_id' => $this->ingredient->id,
        'available_qty' => 100,
        'reserved_qty' => 0,
    ]);

    $this->menuCategory = MenuCategory::create(['name' => 'Test Menu Category', 'is_active' => true]);
    $this->menuItem = MenuItem::create([
        'menu_category_id' => $this->menuCategory->id,
        'name' => 'Test Burger',
        'price' => 15.00,
        'is_active' => true,
        'is_available' => true,
    ]);

    RecipeItem::create([
        'menu_item_id' => $this->menuItem->id,
        'ingredient_id' => $this->ingredient->id,
        'quantity' => 1,
        'uom_id' => $uom->id,
    ]);
});

test('exact payment -> $0 change', function () {
    $this->actingAs($this->user);

    $response = $this->post('/menu-pos/terminal/checkout', [
        'customer_name' => 'John Exact',
        'order_type' => 'Dine-in',
        'payment_method' => 'Cash',
        'tendered_amount' => 15.00,
        'change_amount' => 0.00,
        'cart' => [
            [
                'menu_item_id' => $this->menuItem->id,
                'quantity' => 1,
                'price' => 15.00,
                'notes' => '',
                'modifiers' => []
            ]
        ]
    ]);

    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('pos_orders', [
        'customer_name' => 'John Exact',
        'payment_method' => 'Cash',
        'grand_total' => 15.00,
    ]);
});

test('overpayment -> correct change', function () {
    $this->actingAs($this->user);

    $response = $this->post('/menu-pos/terminal/checkout', [
        'customer_name' => 'Jane Overpay',
        'order_type' => 'Takeaway',
        'payment_method' => 'Cash',
        'tendered_amount' => 50.00,
        'change_amount' => 35.00,
        'cart' => [
            [
                'menu_item_id' => $this->menuItem->id,
                'quantity' => 1,
                'price' => 15.00,
                'notes' => '',
                'modifiers' => []
            ]
        ]
    ]);

    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('pos_orders', [
        'customer_name' => 'Jane Overpay',
        'payment_method' => 'Cash',
        'grand_total' => 15.00,
    ]);
});

test('insufficient payment -> fails validation', function () {
    $this->actingAs($this->user);

    $response = $this->post('/menu-pos/terminal/checkout', [
        'customer_name' => 'Broke Customer',
        'order_type' => 'Dine-in',
        'payment_method' => 'Cash',
        'tendered_amount' => 10.00,
        'change_amount' => 0.00,
        'cart' => [
            [
                'menu_item_id' => $this->menuItem->id,
                'quantity' => 1,
                'price' => 15.00,
                'notes' => '',
                'modifiers' => []
            ]
        ]
    ]);

    $response->assertSessionHasErrors('tendered_amount');
});

test('preset Quick Cash buttons', function (float $presetAmount) {
    $this->actingAs($this->user);
    $change = $presetAmount - 15.00;

    $response = $this->post('/menu-pos/terminal/checkout', [
        'customer_name' => 'Preset Tester',
        'order_type' => 'Dine-in',
        'payment_method' => 'Cash',
        'tendered_amount' => $presetAmount,
        'change_amount' => $change,
        'cart' => [
            [
                'menu_item_id' => $this->menuItem->id,
                'quantity' => 1,
                'price' => 15.00,
                'notes' => '',
                'modifiers' => []
            ]
        ]
    ]);

    $response->assertSessionHasNoErrors();
})->with([20.00, 50.00, 100.00]);

test('normal cash checkout -> creates order and deducts inventory', function () {
    $this->actingAs($this->user);

    $initialStock = InventoryBalance::where('ingredient_id', $this->ingredient->id)->sum('available_qty');

    $response = $this->post('/menu-pos/terminal/checkout', [
        'customer_name' => 'Normal Cash',
        'order_type' => 'Dine-in',
        'payment_method' => 'Cash',
        'tendered_amount' => 40.00,
        'change_amount' => 10.00,
        'cart' => [
            [
                'menu_item_id' => $this->menuItem->id,
                'quantity' => 2,
                'price' => 15.00,
                'notes' => '',
                'modifiers' => []
            ]
        ]
    ]);

    $response->assertSessionHasNoErrors();

    // Check stock was deducted by 2 units
    $finalStock = InventoryBalance::where('ingredient_id', $this->ingredient->id)->sum('available_qty');
    expect($finalStock)->toBe($initialStock - 2);
});

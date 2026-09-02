<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\BusinessLocation;
use App\Models\StorageLocation;
use App\Models\Ingredient;
use App\Models\UnitOfMeasure;
use App\Models\InventoryBalance;

beforeEach(function () {
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
        'price' => 20.00,
        'description' => 'Burger',
        'is_active' => true,
    ]);
});

test('it calculates fixed discounts correctly during checkout', function () {
    $this->actingAs($this->user);

    $response = $this->post('/menu-pos/terminal/checkout', [
        'customer_name' => 'Fixed Discount Tester',
        'order_type' => 'Dine-in',
        'payment_method' => 'Cash',
        'tendered_amount' => 15.00,
        'change_amount' => 0.00,
        'discount_type' => 'Fixed',
        'discount_amount' => 5.00,
        'cart' => [
            [
                'menu_item_id' => $this->menuItem->id,
                'quantity' => 1,
                'price' => 20.00,
                'notes' => '',
                'modifiers' => []
            ]
        ]
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('pos_orders', [
        'customer_name' => 'Fixed Discount Tester',
        'discount_total' => 5.00,
        'grand_total' => 15.00,
    ]);
});

test('it calculates percentage discounts correctly during checkout', function () {
    $this->actingAs($this->user);

    $response = $this->post('/menu-pos/terminal/checkout', [
        'customer_name' => 'Percentage Discount Tester',
        'order_type' => 'Takeaway',
        'payment_method' => 'Card',
        'tendered_amount' => 18.00, // 20 * (1 - 0.10)
        'change_amount' => 0.00,
        'discount_type' => 'Percentage',
        'discount_amount' => 10.00, // 10%
        'cart' => [
            [
                'menu_item_id' => $this->menuItem->id,
                'quantity' => 1,
                'price' => 20.00,
                'notes' => '',
                'modifiers' => []
            ]
        ]
    ]);

    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('pos_orders', [
        'customer_name' => 'Percentage Discount Tester',
        'discount_total' => 2.00,
        'grand_total' => 18.00,
    ]);
});

test('it prevents invalid discount configurations', function () {
    $this->actingAs($this->user);

    $response = $this->post('/menu-pos/terminal/checkout', [
        'customer_name' => 'Hacker',
        'order_type' => 'Takeaway',
        'payment_method' => 'Cash',
        'tendered_amount' => 20.00,
        'change_amount' => 0.00,
        'discount_type' => 'Percentage',
        'discount_amount' => 150.00, // Invalid: over 100%
        'cart' => [
            [
                'menu_item_id' => $this->menuItem->id,
                'quantity' => 1,
                'price' => 20.00,
                'notes' => '',
                'modifiers' => []
            ]
        ]
    ]);

    $response->assertSessionHasErrors('discount_amount');
});

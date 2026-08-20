<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\BusinessLocation;
use App\Models\StorageLocation;
use App\Models\Ingredient;
use App\Models\UnitOfMeasure;
use App\Models\IngredientCategory;
use App\Models\InventoryBalance;

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
        'code' => 'ING-DASH-' . rand(100, 999),
        'name' => 'Ice Cubes',
        'ingredient_category_id' => $cat->id,
        'base_uom_id' => $uom->id,
        'is_inventory_item' => 1,
        'is_purchasable' => 1,
        'is_recipe_item' => 1,
    ]);
});

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($this->user);

    $this->get(route('dashboard'))->assertOk();
});

test('case 1: Main Store = 0, Main Kitchen = 340 -> Dashboard does NOT show Out of Stock (total = 340)', function () {
    $this->actingAs($this->user);

    InventoryBalance::create(['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 0]);
    InventoryBalance::create(['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 340]);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => 
        $page->where('lowStockItems', function ($items) {
            return collect($items)->where('name', 'Ice Cubes')->isEmpty();
        })
    );
});

test('case 2: Main Store = 0, Main Kitchen = 0 -> Dashboard shows Out of Stock (total = 0)', function () {
    $this->actingAs($this->user);

    InventoryBalance::create(['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 0]);
    InventoryBalance::create(['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 0]);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => 
        $page->where('lowStockItems', function ($items) {
            $ice = collect($items)->firstWhere('name', 'Ice Cubes');
            return $ice && $ice['qty'] == 0;
        })
    );
});

test('case 3: Main Store = 0, Main Kitchen = 8 -> Dashboard shows Low Stock (total = 8)', function () {
    $this->actingAs($this->user);

    InventoryBalance::create(['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 0]);
    InventoryBalance::create(['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 8]);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => 
        $page->where('lowStockItems', function ($items) {
            $ice = collect($items)->firstWhere('name', 'Ice Cubes');
            return $ice && $ice['qty'] == 8;
        })
    );
});

test('case 4: Main Store = 5, Main Kitchen = 5 -> Dashboard shows Low Stock (total = 10)', function () {
    $this->actingAs($this->user);

    InventoryBalance::create(['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 5]);
    InventoryBalance::create(['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 5]);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => 
        $page->where('lowStockItems', function ($items) {
            $ice = collect($items)->firstWhere('name', 'Ice Cubes');
            return $ice && $ice['qty'] == 10;
        })
    );
});

test('case 5: Main Store = 20, Main Kitchen = 340 -> Dashboard treats stock as Normal', function () {
    $this->actingAs($this->user);

    InventoryBalance::create(['storage_location_id' => $this->mainStore->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 20]);
    InventoryBalance::create(['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 340]);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => 
        $page->where('lowStockItems', function ($items) {
            return collect($items)->where('name', 'Ice Cubes')->isEmpty();
        })
    );
});

test('case 6: Missing Main Store row, Main Kitchen = 340 -> Dashboard total = 340 (Not Out of Stock)', function () {
    $this->actingAs($this->user);

    // No row created for Main Store
    InventoryBalance::create(['storage_location_id' => $this->mainKitchen->id, 'ingredient_id' => $this->ingredient->id, 'available_qty' => 340]);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => 
        $page->where('lowStockItems', function ($items) {
            return collect($items)->where('name', 'Ice Cubes')->isEmpty();
        })
    );
});

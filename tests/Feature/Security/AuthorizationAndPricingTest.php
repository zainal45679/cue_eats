<?php

declare(strict_types=1);

use App\Models\BusinessLocation;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;

test('a non administrator cannot assign the administrator role', function () {
    $location = BusinessLocation::factory()->create();
    $user = User::factory()->create(['business_location_id' => $location->id]);
    $permission = Permission::firstOrCreate(['name' => 'create.users', 'guard_name' => 'web']);
    $user->givePermissionTo($permission);
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $this->actingAs($user)
        ->post('/users', [
            'name' => 'Unauthorized Admin',
            'email' => 'unauthorized-admin@example.test',
            'password' => 'password',
            'role' => 'admin',
            'status' => true,
        ])
        ->assertForbidden();

    $this->assertDatabaseMissing('users', ['email' => 'unauthorized-admin@example.test']);
});

test('checkout derives the item price from the server catalog', function () {
    $location = BusinessLocation::factory()->create();
    $user = User::factory()->create(['business_location_id' => $location->id]);
    $category = MenuCategory::create(['name' => 'Security Test', 'is_active' => true]);
    $item = MenuItem::create([
        'menu_category_id' => $category->id,
        'name' => 'Catalog Priced Item',
        'price' => 100,
        'is_active' => true,
        'is_available' => true,
    ]);

    $this->actingAs($user)
        ->post('/menu-pos/terminal/checkout', [
            'order_type' => 'Takeaway',
            'payment_method' => 'Cash',
            'tendered_amount' => 100,
            'cart' => [[
                'menu_item_id' => $item->id,
                'quantity' => 1,
                'price' => 1,
                'modifiers' => [],
            ]],
        ])
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('pos_orders', [
        'grand_total' => 100,
        'status' => 'Completed',
    ]);
});

test('cash checkout rejects zero tender when money is due', function () {
    $location = BusinessLocation::factory()->create();
    $user = User::factory()->create(['business_location_id' => $location->id]);
    $category = MenuCategory::create(['name' => 'Cash Test', 'is_active' => true]);
    $item = MenuItem::create([
        'menu_category_id' => $category->id,
        'name' => 'Cash Item',
        'price' => 25,
        'is_active' => true,
        'is_available' => true,
    ]);

    $this->actingAs($user)
        ->post('/menu-pos/terminal/checkout', [
            'order_type' => 'Takeaway',
            'payment_method' => 'Cash',
            'tendered_amount' => 0,
            'cart' => [[
                'menu_item_id' => $item->id,
                'quantity' => 1,
                'price' => 25,
                'modifiers' => [],
            ]],
        ])
        ->assertSessionHasErrors('tendered_amount');

    $this->assertDatabaseCount('pos_orders', 0);
});

<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\BusinessLocation;
use App\Models\DiningTable;
use App\Models\MenuItem;
use App\Models\MenuCategory;
use App\Models\Order;
use App\Models\PosKot;

beforeEach(function () {
    $this->location = BusinessLocation::factory()->create(['location_name' => 'Main Dining Location']);
    $this->user = User::factory()->create(['business_location_id' => $this->location->id]);
    $this->user->assignRole(\App\Models\Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']));

    $this->category = MenuCategory::firstOrCreate(['name' => 'Fast Food']);
    $this->burger = MenuItem::create(['name' => 'Beef Burger', 'price' => 10.00, 'menu_category_id' => $this->category->id]);
    $this->fries = MenuItem::create(['name' => 'French Fries', 'price' => 5.00, 'menu_category_id' => $this->category->id]);
    $this->coke = MenuItem::create(['name' => 'Cold Coke', 'price' => 3.00, 'menu_category_id' => $this->category->id]);

    $this->zone = \App\Models\DiningZone::create(['name' => 'Main Hall', 'business_location_id' => $this->location->id]);
    $this->table = DiningTable::create(['name' => 'Table 10', 'seating_capacity' => 4, 'status' => 'available', 'dining_zone_id' => $this->zone->id]);
});

test('saving initial KOT creates Round 1 KOT and sets table status to occupied', function () {
    $this->actingAs($this->user);

    $response = $this->post('/menu-pos/terminal/checkout', [
        'action' => 'save_kot',
        'dining_table_id' => $this->table->id,
        'order_type' => 'Dine-in',
        'cart' => [
            ['menu_item_id' => $this->burger->id, 'quantity' => 1, 'price' => 10.00],
            ['menu_item_id' => $this->fries->id, 'quantity' => 1, 'price' => 5.00],
        ]
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('pos_orders', [
        'dining_table_id' => $this->table->id,
        'status' => 'running',
    ]);

    $this->assertDatabaseHas('dining_tables', [
        'id' => $this->table->id,
        'status' => 'occupied',
    ]);

    $order = Order::where('dining_table_id', $this->table->id)->first();
    expect($order->kots->count())->toBe(1);

    $kot1 = $order->kots->first();
    expect($kot1->round_number)->toBe(1)
        ->and($kot1->items->count())->toBe(2);
});

test('subsequent save KOT creates Round 2 containing only newly added items without reprinting Round 1', function () {
    $this->actingAs($this->user);

    // Round 1
    $this->post('/menu-pos/terminal/checkout', [
        'action' => 'save_kot',
        'dining_table_id' => $this->table->id,
        'order_type' => 'Dine-in',
        'cart' => [
            ['menu_item_id' => $this->burger->id, 'quantity' => 1, 'price' => 10.00],
        ]
    ]);

    $order = Order::where('dining_table_id', $this->table->id)->first();

    // Round 2 (subsequent order addition)
    $response = $this->post('/menu-pos/terminal/checkout', [
        'action' => 'save_kot',
        'order_id' => $order->id,
        'dining_table_id' => $this->table->id,
        'order_type' => 'Dine-in',
        'cart' => [
            ['menu_item_id' => $this->coke->id, 'quantity' => 2, 'price' => 3.00],
        ]
    ]);

    $response->assertSessionHasNoErrors();
    $orderFresh = $order->fresh(['kots.items']);
    expect($orderFresh->kots->count())->toBe(2);

    $kot2 = $orderFresh->kots->where('round_number', 2)->first();
    expect($kot2)->not->toBeNull()
        ->and($kot2->items->count())->toBe(1)
        ->and($kot2->items->first()->menu_item_id)->toBe($this->coke->id)
        ->and($kot2->items->first()->quantity)->toBe(2);

    // Verify overall order totals aggregate both Round 1 ($10) and Round 2 ($6) = $16
    expect((float)$orderFresh->grand_total)->toBe(16.00);
});

test('clicking save_kot with no new items returns info notice without creating empty KOT', function () {
    $this->actingAs($this->user);

    // Round 1
    $this->post('/menu-pos/terminal/checkout', [
        'action' => 'save_kot',
        'dining_table_id' => $this->table->id,
        'order_type' => 'Dine-in',
        'cart' => [
            ['menu_item_id' => $this->burger->id, 'quantity' => 1, 'price' => 10.00],
        ]
    ]);

    $order = Order::where('dining_table_id', $this->table->id)->first();

    // Attempt save_kot with empty cart
    $response = $this->post('/menu-pos/terminal/checkout', [
        'action' => 'save_kot',
        'order_id' => $order->id,
        'dining_table_id' => $this->table->id,
        'order_type' => 'Dine-in',
        'cart' => []
    ]);

    $response->assertSessionHas('info');
    expect(PosKot::where('pos_order_id', $order->id)->count())->toBe(1);
});

test('regular POS complete payment includes both customer receipt and KOT payload', function () {
    $this->actingAs($this->user);

    $response = $this->post('/menu-pos/terminal/checkout', [
        'action' => 'settle',
        'order_type' => 'Takeaway',
        'payment_method' => 'Cash',
        'tendered_amount' => 20.00,
        'cart' => [
            ['menu_item_id' => $this->burger->id, 'quantity' => 1, 'price' => 10.00],
        ]
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('recent_order');
    $response->assertSessionHas('recent_kot');
});

test('dining-in print bill returns accumulated order and sets is_bill_only flag', function () {
    $this->actingAs($this->user);

    // Create Dine-in order
    $this->post('/menu-pos/terminal/checkout', [
        'action' => 'save_kot',
        'dining_table_id' => $this->table->id,
        'order_type' => 'Dine-in',
        'cart' => [
            ['menu_item_id' => $this->burger->id, 'quantity' => 1, 'price' => 10.00],
        ]
    ]);

    $order = Order::where('dining_table_id', $this->table->id)->first();

    // Print Bill
    $response = $this->post('/menu-pos/terminal/checkout', [
        'action' => 'print_bill',
        'order_id' => $order->id,
        'order_type' => 'Dine-in',
        'cart' => []
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('recent_order');
    $response->assertSessionHas('is_bill_only', true);
});

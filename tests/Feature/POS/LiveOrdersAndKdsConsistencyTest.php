<?php

declare(strict_types=1);

use App\Models\BusinessLocation;
use App\Models\DiningTable;
use App\Models\DiningZone;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PosKot;
use App\Models\PosKotItem;
use App\Models\User;

beforeEach(function () {
    $this->location = BusinessLocation::factory()->create([
        'is_sales_enabled' => true,
    ]);
    $this->user = User::factory()->create([
        'business_location_id' => $this->location->id,
    ]);
    $this->user->assignRole(\App\Models\Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']));

    $this->zone = DiningZone::create([
        'business_location_id' => $this->location->id,
        'name' => 'Main Dining',
    ]);

    $this->table = DiningTable::create([
        'dining_zone_id' => $this->zone->id,
        'name' => 'Table 10',
        'seating_capacity' => 4,
        'status' => 'available',
    ]);

    $this->category = MenuCategory::create([
        'name' => 'Burgers',
        'is_active' => true,
    ]);

    $this->menuItem = MenuItem::create([
        'menu_category_id' => $this->category->id,
        'name' => 'Cheese Burger',
        'price' => 12.00,
        'is_active' => true,
        'is_available' => true,
    ]);
});

test('live orders excludes completed orders even if kitchen status is pending or preparing', function () {
    $this->actingAs($this->user);

    // Active running order
    $runningOrder = Order::create([
        'order_number' => 'ORD-RUNNING-1',
        'business_location_id' => $this->location->id,
        'user_id' => $this->user->id,
        'order_type' => 'Dine-in',
        'status' => 'running',
        'kitchen_status' => 'pending',
        'dining_table_id' => $this->table->id,
        'grand_total' => 12.00,
    ]);
    OrderItem::create([
        'pos_order_id' => $runningOrder->id,
        'menu_item_id' => $this->menuItem->id,
        'quantity' => 1,
        'unit_price' => 12.00,
        'subtotal' => 12.00,
    ]);

    // Ghost/Completed order with kitchen_status=preparing
    $completedOrder = Order::create([
        'order_number' => 'ORD-COMPLETED-1',
        'business_location_id' => $this->location->id,
        'user_id' => $this->user->id,
        'order_type' => 'Dine-in',
        'status' => 'Completed',
        'kitchen_status' => 'preparing',
        'grand_total' => 12.00,
    ]);
    OrderItem::create([
        'pos_order_id' => $completedOrder->id,
        'menu_item_id' => $this->menuItem->id,
        'quantity' => 1,
        'unit_price' => 12.00,
        'subtotal' => 12.00,
    ]);

    $response = $this->withSession(['active_location_id' => $this->location->id])
        ->get('/menu-pos/live-orders');

    $response->assertOk();
    $orders = $response->viewData('page')['props']['orders'];
    $orderNumbers = collect($orders)->pluck('order_number')->all();

    expect($orderNumbers)->toContain('ORD-RUNNING-1');
    expect($orderNumbers)->not->toContain('ORD-COMPLETED-1');
});

test('kds displays active orders with items even if no KOT record exists', function () {
    $this->actingAs($this->user);

    $orderWithoutKot = Order::create([
        'order_number' => 'ORD-NO-KOT-1',
        'business_location_id' => $this->location->id,
        'user_id' => $this->user->id,
        'order_type' => 'Dine-in',
        'status' => 'running',
        'kitchen_status' => 'pending',
        'grand_total' => 12.00,
    ]);
    OrderItem::create([
        'pos_order_id' => $orderWithoutKot->id,
        'menu_item_id' => $this->menuItem->id,
        'quantity' => 1,
        'unit_price' => 12.00,
        'subtotal' => 12.00,
    ]);

    $response = $this->withSession(['active_location_id' => $this->location->id])
        ->get('/menu-pos/kds');

    $response->assertOk();
    $orders = $response->viewData('page')['props']['orders'];
    $orderNumbers = collect($orders)->pluck('order_number')->all();

    expect($orderNumbers)->toContain('ORD-NO-KOT-1');
});

test('settling an order transitions kitchen_status and active kots to ready', function () {
    $this->actingAs($this->user);

    $order = Order::create([
        'order_number' => 'ORD-SETTLE-TEST',
        'business_location_id' => $this->location->id,
        'user_id' => $this->user->id,
        'order_type' => 'Dine-in',
        'status' => 'running',
        'kitchen_status' => 'preparing',
        'dining_table_id' => $this->table->id,
        'subtotal' => 12.00,
        'grand_total' => 12.00,
    ]);

    $orderItem = OrderItem::create([
        'pos_order_id' => $order->id,
        'menu_item_id' => $this->menuItem->id,
        'quantity' => 1,
        'unit_price' => 12.00,
        'subtotal' => 12.00,
    ]);

    $kot = PosKot::create([
        'pos_order_id' => $order->id,
        'round_number' => 1,
        'kot_number' => 'KOT-ORD-SETTLE-TEST-R1',
        'status' => 'preparing',
        'created_by' => $this->user->id,
    ]);

    $response = $this->withSession(['active_location_id' => $this->location->id])
        ->post('/menu-pos/terminal/checkout', [
            'action' => 'settle',
            'order_id' => $order->id,
            'dining_table_id' => $this->table->id,
            'order_type' => 'Dine-in',
            'payment_method' => 'Cash',
            'tendered_amount' => 12.00,
            'cart' => [],
        ]);

    $response->assertSessionHasNoErrors();

    $order->refresh();
    $kot->refresh();

    expect($order->status)->toBe('Completed');
    expect($order->kitchen_status)->toBe('ready');
    expect($kot->status)->toBe('ready');
});

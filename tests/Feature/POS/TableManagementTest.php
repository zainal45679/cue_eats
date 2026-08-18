<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\BusinessLocation;
use App\Models\DiningZone;
use App\Models\DiningTable;
use App\Models\Order;

beforeEach(function () {
    $this->location = BusinessLocation::factory()->create();
    $this->user = User::factory()->create(['business_location_id' => $this->location->id]);
    $this->user->assignRole(\App\Models\Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']));
});

test('admin can create, update, and delete a dining zone', function () {
    $this->actingAs($this->user);

    // Create Zone
    $response = $this->post('/menu-pos/zones', [
        'name' => 'Rooftop Deck',
        'description' => 'Open-air rooftop seating',
    ]);
    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('dining_zones', ['name' => 'Rooftop Deck']);

    $zone = DiningZone::where('name', 'Rooftop Deck')->first();

    // Update Zone
    $response = $this->put("/menu-pos/zones/{$zone->id}", [
        'name' => 'Sky Terrace',
        'description' => 'Updated terrace description',
    ]);
    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('dining_zones', ['name' => 'Sky Terrace']);

    // Delete Zone
    $response = $this->delete("/menu-pos/zones/{$zone->id}");
    $response->assertSessionHasNoErrors();
    $this->assertDatabaseMissing('dining_zones', ['id' => $zone->id]);
});

test('admin can create, update, and delete a dining table with seating capacity', function () {
    $this->actingAs($this->user);

    $zone = DiningZone::create([
        'business_location_id' => $this->location->id,
        'name' => 'Patio',
    ]);

    // Create Table
    $response = $this->post('/menu-pos/tables/create', [
        'dining_zone_id' => $zone->id,
        'name' => 'Patio T-10',
        'seating_capacity' => 6,
    ]);
    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('dining_tables', [
        'name' => 'Patio T-10',
        'seating_capacity' => 6,
    ]);

    $table = DiningTable::where('name', 'Patio T-10')->first();

    // Update Table
    $response = $this->put("/menu-pos/tables/{$table->id}", [
        'name' => 'Patio T-10 VIP',
        'seating_capacity' => 8,
    ]);
    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('dining_tables', [
        'id' => $table->id,
        'name' => 'Patio T-10 VIP',
        'seating_capacity' => 8,
    ]);

    // Delete Table
    $response = $this->delete("/menu-pos/tables/{$table->id}");
    $response->assertSessionHasNoErrors();
    $this->assertDatabaseMissing('dining_tables', ['id' => $table->id]);
});

test('cashier can finalize and settle a running dine-in table order with quick cash', function () {
    $this->actingAs($this->user);

    $zone = DiningZone::create([
        'business_location_id' => $this->location->id,
        'name' => 'Main Hall',
    ]);

    $table = DiningTable::create([
        'dining_zone_id' => $zone->id,
        'name' => 'Table 5',
        'seating_capacity' => 4,
        'status' => 'occupied',
    ]);

    $order = Order::create([
        'order_number' => 'ORD-DINE-101',
        'business_location_id' => $this->location->id,
        'user_id' => $this->user->id,
        'dining_table_id' => $table->id,
        'status' => 'running',
        'kitchen_status' => 'pending',
        'subtotal' => 45.00,
        'tax_total' => 0,
        'grand_total' => 45.00,
    ]);

    // Settle Order with Cash
    $response = $this->post('/menu-pos/terminal/checkout', [
        'action' => 'settle',
        'order_id' => $order->id,
        'dining_table_id' => $table->id,
        'payment_method' => 'Cash',
        'tendered_amount' => 50.00,
        'change_amount' => 5.00,
        'order_type' => 'Dine-in',
        'cart' => [],
    ]);

    $response->assertSessionHasNoErrors();

    // Verify order is Completed
    $this->assertDatabaseHas('pos_orders', [
        'id' => $order->id,
        'status' => 'Completed',
        'payment_method' => 'Cash',
    ]);

    // Verify table status was released to available
    $this->assertDatabaseHas('dining_tables', [
        'id' => $table->id,
        'status' => 'available',
    ]);
});

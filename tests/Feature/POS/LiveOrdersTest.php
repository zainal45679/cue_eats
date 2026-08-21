<?php

namespace Tests\Feature\POS;

use App\Models\BusinessLocation;
use App\Models\DiningTable;
use App\Models\DiningZone;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LiveOrdersTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $branchUser;
    protected BusinessLocation $locationA;
    protected BusinessLocation $locationB;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'cashier', 'guard_name' => 'web']);

        $this->locationA = BusinessLocation::factory()->create(['location_name' => 'Location Alpha']);
        $this->locationB = BusinessLocation::factory()->create(['location_name' => 'Location Beta']);

        $this->admin = User::factory()->create(['business_location_id' => $this->locationA->id]);
        $this->admin->assignRole('admin');

        $this->branchUser = User::factory()->create(['business_location_id' => $this->locationA->id]);
        $this->branchUser->assignRole('cashier');
    }

    /** @test */
    public function test_live_orders_returns_active_orders()
    {
        // Active orders
        $pendingOrder = Order::create(['order_number' => 'ORD-ACT-1', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'running', 'kitchen_status' => 'pending', 'grand_total' => 50.00]);
        $preparingOrder = Order::create(['order_number' => 'ORD-ACT-2', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'running', 'kitchen_status' => 'preparing', 'grand_total' => 30.00]);
        $readyOrder = Order::create(['order_number' => 'ORD-ACT-3', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'billed', 'kitchen_status' => 'ready', 'grand_total' => 20.00]);

        // Inactive/completed orders
        $completedOrder = Order::create(['order_number' => 'ORD-CMP-1', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'Completed', 'kitchen_status' => 'ready', 'grand_total' => 100.00]);
        $cancelledOrder = Order::create(['order_number' => 'ORD-CNC-1', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'cancelled', 'kitchen_status' => 'pending', 'grand_total' => 40.00]);
        $rejectedOrder = Order::create(['order_number' => 'ORD-REJ-1', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'running', 'kitchen_status' => 'rejected', 'grand_total' => 25.00]);

        $response = $this->actingAs($this->branchUser)->get(route('live-orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('stats.total_active', 3)
                ->where('stats.pending', 1)
                ->where('stats.preparing', 1)
                ->where('stats.ready', 1)
                ->where('stats.total_value', fn ($val) => (float)$val == 100.00)
                ->where('orders.meta.total', 3)
        );
    }

    /** @test */
    public function test_live_orders_includes_older_unfinished_orders()
    {
        $oldOrder = Order::create([
            'order_number' => 'ORD-OLD-1',
            'business_location_id' => $this->locationA->id,
            'user_id' => $this->branchUser->id,
            'status' => 'running',
            'kitchen_status' => 'pending',
            'grand_total' => 75.00,
        ]);
        $oldOrder->created_at = now()->subDays(5);
        $oldOrder->save();

        $response = $this->actingAs($this->branchUser)->get(route('live-orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('stats.total_active', 1)
                ->where('orders.rows.0.order_number', 'ORD-OLD-1')
        );
    }

    /** @test */
    public function test_total_active_kpi_excludes_completed_orders()
    {
        Order::create(['order_number' => 'ORD-ACT-1', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'running', 'kitchen_status' => 'pending', 'grand_total' => 10.00]);
        Order::create(['order_number' => 'ORD-COMP-1', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'Completed', 'kitchen_status' => 'ready', 'grand_total' => 500.00]);

        $response = $this->actingAs($this->branchUser)->get(route('live-orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('stats.total_active', 1)
        );
    }

    /** @test */
    public function test_total_value_kpi_excludes_completed_orders()
    {
        Order::create(['order_number' => 'ORD-ACT-1', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'running', 'kitchen_status' => 'preparing', 'grand_total' => 45.50]);
        Order::create(['order_number' => 'ORD-COMP-1', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'Completed', 'kitchen_status' => 'ready', 'grand_total' => 999.99]);

        $response = $this->actingAs($this->branchUser)->get(route('live-orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('stats.total_value', fn ($val) => (float)$val == 45.50)
        );
    }

    /** @test */
    public function test_live_orders_location_isolation()
    {
        Order::create(['order_number' => 'ORD-LOC-A', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'running', 'kitchen_status' => 'pending', 'grand_total' => 20.00]);
        Order::create(['order_number' => 'ORD-LOC-B', 'business_location_id' => $this->locationB->id, 'user_id' => $this->branchUser->id, 'status' => 'running', 'kitchen_status' => 'pending', 'grand_total' => 40.00]);

        $response = $this->actingAs($this->branchUser)->get(route('live-orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('stats.total_active', 1)
                ->where('orders.rows.0.order_number', 'ORD-LOC-A')
        );
    }

    /** @test */
    public function test_admin_all_outlets_behavior()
    {
        session()->forget('active_location_id');

        Order::create(['order_number' => 'ORD-ADM-A', 'business_location_id' => $this->locationA->id, 'user_id' => $this->admin->id, 'status' => 'running', 'kitchen_status' => 'pending', 'grand_total' => 15.00]);
        Order::create(['order_number' => 'ORD-ADM-B', 'business_location_id' => $this->locationB->id, 'user_id' => $this->admin->id, 'status' => 'running', 'kitchen_status' => 'preparing', 'grand_total' => 25.00]);

        $response = $this->actingAs($this->admin)->get(route('live-orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('stats.total_active', 2)
                ->where('stats.total_value', fn ($val) => (float)$val == 40.00)
        );
    }

    /** @test */
    public function test_live_orders_pagination_metadata()
    {
        for ($i = 1; $i <= 15; $i++) {
            Order::create(['order_number' => "ORD-PAG-{$i}", 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'running', 'kitchen_status' => 'pending', 'grand_total' => 10.00]);
        }

        $response = $this->actingAs($this->branchUser)->get(route('live-orders.index', ['perPage' => 10, 'page' => 1]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('orders.meta.currentPage', 1)
                ->where('orders.meta.perPage', 10)
                ->where('orders.meta.lastPage', 2)
                ->where('orders.meta.total', 15)
                ->where('stats.total_active', 15)
        );
    }

    /** @test */
    public function test_live_orders_pagination_returns_correct_rows()
    {
        for ($i = 1; $i <= 15; $i++) {
            Order::create(['order_number' => sprintf('ORD-PAG-%02d', $i), 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'running', 'kitchen_status' => 'pending', 'grand_total' => 10.00]);
        }

        $responsePage1 = $this->actingAs($this->branchUser)->get(route('live-orders.index', ['perPage' => 10, 'page' => 1]));
        $responsePage1->assertStatus(200);

        $responsePage2 = $this->actingAs($this->branchUser)->get(route('live-orders.index', ['perPage' => 10, 'page' => 2]));
        $responsePage2->assertStatus(200);

        $page1Orders = collect($responsePage1->inertiaProps()['orders']['rows'])->pluck('order_number');
        $page2Orders = collect($responsePage2->inertiaProps()['orders']['rows'])->pluck('order_number');

        $this->assertCount(10, $page1Orders);
        $this->assertCount(5, $page2Orders);
        $this->assertEmpty($page1Orders->intersect($page2Orders));
    }

    /** @test */
    public function test_live_orders_search()
    {
        Order::create(['order_number' => 'ORD-SEARCH-TARGET', 'customer_name' => 'John Doe', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'running', 'kitchen_status' => 'pending', 'grand_total' => 50.00]);
        Order::create(['order_number' => 'ORD-SEARCH-OTHER', 'customer_name' => 'Jane Smith', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'running', 'kitchen_status' => 'pending', 'grand_total' => 30.00]);

        $response = $this->actingAs($this->branchUser)->get(route('live-orders.index', ['search' => 'TARGET']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('orders.meta.total', 1)
                ->where('orders.rows.0.order_number', 'ORD-SEARCH-TARGET')
        );
    }

    /** @test */
    public function test_live_orders_dine_in_relationships()
    {
        $zone = DiningZone::create(['business_location_id' => $this->locationA->id, 'name' => 'Main Terrace']);
        $table = DiningTable::create(['dining_zone_id' => $zone->id, 'name' => 'Table 12', 'seating_capacity' => 4, 'status' => 'occupied']);
        $waiter = User::factory()->create(['business_location_id' => $this->locationA->id, 'name' => 'Alex Waiter']);

        $order = Order::create([
            'order_number' => 'ORD-DINE-1',
            'business_location_id' => $this->locationA->id,
            'user_id' => $this->branchUser->id,
            'dining_table_id' => $table->id,
            'waiter_id' => $waiter->id,
            'order_type' => 'Dine-in',
            'status' => 'running',
            'kitchen_status' => 'pending',
            'grand_total' => 85.00
        ]);

        $response = $this->actingAs($this->branchUser)->get(route('live-orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('orders.rows.0.dining_table.name', 'Table 12')
                ->where('orders.rows.0.waiter.name', 'Alex Waiter')
        );
    }

    /** @test */
    public function test_live_orders_does_not_change_order_financial_totals()
    {
        $cat = \App\Models\MenuCategory::create(['name' => 'Mains']);
        $item = MenuItem::create(['menu_category_id' => $cat->id, 'name' => 'Burger', 'price' => 15.00, 'is_available' => true]);
        $order = Order::create([
            'order_number' => 'ORD-FIN-1',
            'business_location_id' => $this->locationA->id,
            'user_id' => $this->branchUser->id,
            'status' => 'running',
            'kitchen_status' => 'pending',
            'subtotal' => 15.00,
            'tax_total' => 0.00,
            'grand_total' => 15.00
        ]);
        OrderItem::create(['pos_order_id' => $order->id, 'menu_item_id' => $item->id, 'quantity' => 1, 'unit_price' => 15.00, 'subtotal' => 15.00]);

        $response = $this->actingAs($this->branchUser)->get(route('live-orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('orders.rows.0.grand_total', fn ($val) => (float)$val == 15.00)
                ->where('stats.total_value', fn ($val) => (float)$val == 15.00)
        );
        $this->assertEquals(15.00, $order->fresh()->grand_total);
    }

    /** @test */
    public function test_live_orders_includes_newly_created_pos_order_at_top_of_page_1()
    {
        // Create 15 existing orders with older timestamps
        for ($i = 1; $i <= 15; $i++) {
            $ord = Order::create([
                'order_number' => sprintf('ORD-OLD-%02d', $i),
                'business_location_id' => $this->locationA->id,
                'user_id' => $this->branchUser->id,
                'status' => 'running',
                'kitchen_status' => 'pending',
                'grand_total' => 10.00,
            ]);
            $ord->created_at = now()->subMinutes(60 - $i);
            $ord->save();
        }

        // Create a BRAND-NEW order created right now
        $newestOrder = Order::create([
            'order_number' => 'ORD-NEWEST-NOW',
            'business_location_id' => $this->locationA->id,
            'user_id' => $this->branchUser->id,
            'status' => 'running',
            'kitchen_status' => 'pending',
            'grand_total' => 99.00,
        ]);

        $response = $this->actingAs($this->branchUser)->get(route('live-orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('orders.meta.currentPage', 1)
                ->where('orders.meta.total', 16)
                ->where('orders.rows.0.order_number', 'ORD-NEWEST-NOW')
        );
    }

    /** @test */
    public function test_live_orders_includes_draft_running_billed_orders_and_excludes_completed()
    {
        Order::create(['order_number' => 'ORD-DRAFT-1', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'draft', 'kitchen_status' => 'pending', 'grand_total' => 10.00]);
        Order::create(['order_number' => 'ORD-RUNNING-1', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'running', 'kitchen_status' => 'preparing', 'grand_total' => 20.00]);
        Order::create(['order_number' => 'ORD-BILLED-1', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'billed', 'kitchen_status' => 'ready', 'grand_total' => 30.00]);

        Order::create(['order_number' => 'ORD-SETTLED-1', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'Completed', 'kitchen_status' => 'ready', 'grand_total' => 40.00]);
        Order::create(['order_number' => 'ORD-PAID-1', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'status' => 'paid', 'kitchen_status' => 'ready', 'grand_total' => 50.00]);

        $response = $this->actingAs($this->branchUser)->get(route('live-orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('stats.total_active', 3)
                ->where('orders.meta.total', 3)
        );
    }

    /** @test */
    public function test_live_orders_real_pos_checkout_flow()
    {
        $cat = \App\Models\MenuCategory::create(['name' => 'Starters']);
        $item = MenuItem::create(['menu_category_id' => $cat->id, 'name' => 'Fries', 'price' => 5.00, 'is_available' => true]);

        // Post order creation via POS checkout endpoint
        $checkoutResponse = $this->actingAs($this->branchUser)->post(route('pos.checkout'), [
            'order_type' => 'Takeaway',
            'customer_name' => 'Alice Customer',
            'action' => 'save_kot',
            'items' => [
                ['menu_item_id' => $item->id, 'quantity' => 2, 'unit_price' => 5.00, 'subtotal' => 10.00]
            ]
        ]);

        $checkoutResponse->assertStatus(302);

        // Immediately check Live Orders
        $liveOrdersResponse = $this->actingAs($this->branchUser)->get(route('live-orders.index'));

        $liveOrdersResponse->assertStatus(200);
        $liveOrdersResponse->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('stats.total_active', 1)
                ->where('orders.rows.0.customer_name', 'Alice Customer')
                ->where('orders.rows.0.kitchen_status', 'pending')
        );
    }

    /** @test */
    public function test_live_orders_includes_dine_in_order()
    {
        Order::create([
            'order_number' => 'ORD-DINE-1',
            'business_location_id' => $this->locationA->id,
            'user_id' => $this->branchUser->id,
            'order_type' => 'Dine-in',
            'status' => 'running',
            'kitchen_status' => 'pending',
            'grand_total' => 40.00
        ]);

        $response = $this->actingAs($this->branchUser)->get(route('live-orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('stats.total_active', 1)
                ->where('orders.rows.0.order_type', 'Dine-in')
        );
    }

    /** @test */
    public function test_live_orders_includes_takeaway_order()
    {
        Order::create([
            'order_number' => 'ORD-TAKEAWAY-1',
            'business_location_id' => $this->locationA->id,
            'user_id' => $this->branchUser->id,
            'order_type' => 'Takeaway',
            'status' => 'Completed',
            'kitchen_status' => 'pending',
            'grand_total' => 25.00
        ]);

        $response = $this->actingAs($this->branchUser)->get(route('live-orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('stats.total_active', 1)
                ->where('orders.rows.0.order_type', 'Takeaway')
        );
    }

    /** @test */
    public function test_live_orders_includes_delivery_order()
    {
        Order::create([
            'order_number' => 'ORD-DELIVERY-1',
            'business_location_id' => $this->locationA->id,
            'user_id' => $this->branchUser->id,
            'order_type' => 'Delivery',
            'status' => 'Completed',
            'kitchen_status' => 'preparing',
            'grand_total' => 60.00
        ]);

        $response = $this->actingAs($this->branchUser)->get(route('live-orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('stats.total_active', 1)
                ->where('orders.rows.0.order_type', 'Delivery')
        );
    }

    /** @test */
    public function test_takeaway_order_is_persisted_correctly()
    {
        $order = Order::create([
            'order_number' => 'ORD-PER-TAKEAWAY',
            'business_location_id' => $this->locationA->id,
            'user_id' => $this->branchUser->id,
            'order_type' => 'Takeaway',
            'status' => 'Completed',
            'kitchen_status' => 'pending',
            'grand_total' => 35.00
        ]);

        $this->assertDatabaseHas('pos_orders', [
            'id' => $order->id,
            'order_number' => 'ORD-PER-TAKEAWAY',
            'order_type' => 'Takeaway',
            'kitchen_status' => 'pending',
        ]);
    }

    /** @test */
    public function test_delivery_order_is_persisted_correctly()
    {
        $order = Order::create([
            'order_number' => 'ORD-PER-DELIVERY',
            'business_location_id' => $this->locationA->id,
            'user_id' => $this->branchUser->id,
            'order_type' => 'Delivery',
            'status' => 'Completed',
            'kitchen_status' => 'preparing',
            'grand_total' => 45.00
        ]);

        $this->assertDatabaseHas('pos_orders', [
            'id' => $order->id,
            'order_number' => 'ORD-PER-DELIVERY',
            'order_type' => 'Delivery',
            'kitchen_status' => 'preparing',
        ]);
    }

    /** @test */
    public function test_takeaway_and_delivery_do_not_require_dining_table()
    {
        $takeaway = Order::create([
            'order_number' => 'ORD-NOTABLE-1',
            'business_location_id' => $this->locationA->id,
            'user_id' => $this->branchUser->id,
            'order_type' => 'Takeaway',
            'dining_table_id' => null,
            'status' => 'Completed',
            'kitchen_status' => 'pending',
            'grand_total' => 20.00
        ]);

        $this->assertNull($takeaway->dining_table_id);

        $response = $this->actingAs($this->branchUser)->get(route('live-orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('orders.rows.0.order_number', 'ORD-NOTABLE-1')
        );
    }

    /** @test */
    public function test_takeaway_and_delivery_do_not_require_waiter()
    {
        $delivery = Order::create([
            'order_number' => 'ORD-NOWAITER-1',
            'business_location_id' => $this->locationA->id,
            'user_id' => $this->branchUser->id,
            'order_type' => 'Delivery',
            'waiter_id' => null,
            'status' => 'Completed',
            'kitchen_status' => 'preparing',
            'grand_total' => 50.00
        ]);

        $this->assertNull($delivery->waiter_id);

        $response = $this->actingAs($this->branchUser)->get(route('live-orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('orders.rows.0.order_number', 'ORD-NOWAITER-1')
        );
    }

    /** @test */
    public function test_live_orders_order_types_are_not_filtered_out()
    {
        Order::create(['order_number' => 'ORD-ALL-1', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'order_type' => 'Dine-in', 'status' => 'running', 'kitchen_status' => 'pending', 'grand_total' => 10.00]);
        Order::create(['order_number' => 'ORD-ALL-2', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'order_type' => 'Takeaway', 'status' => 'Completed', 'kitchen_status' => 'pending', 'grand_total' => 20.00]);
        Order::create(['order_number' => 'ORD-ALL-3', 'business_location_id' => $this->locationA->id, 'user_id' => $this->branchUser->id, 'order_type' => 'Delivery', 'status' => 'Completed', 'kitchen_status' => 'preparing', 'grand_total' => 30.00]);

        $response = $this->actingAs($this->branchUser)->get(route('live-orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('stats.total_active', 3)
                ->where('orders.meta.total', 3)
        );
    }

    /** @test */
    public function test_real_pos_checkout_creates_takeaway_order()
    {
        $cat = \App\Models\MenuCategory::create(['name' => 'Mains']);
        $item = MenuItem::create(['menu_category_id' => $cat->id, 'name' => 'Pizza', 'price' => 12.00, 'is_available' => true]);

        $checkoutResponse = $this->actingAs($this->branchUser)->post(route('pos.checkout'), [
            'order_type' => 'Takeaway',
            'customer_name' => 'Bob Takeaway',
            'action' => 'settle',
            'payment_method' => 'Cash',
            'tendered_amount' => 12.00,
            'items' => [
                ['menu_item_id' => $item->id, 'quantity' => 1, 'unit_price' => 12.00, 'subtotal' => 12.00]
            ]
        ]);

        $checkoutResponse->assertStatus(302);

        $this->assertDatabaseHas('pos_orders', [
            'customer_name' => 'Bob Takeaway',
            'order_type' => 'Takeaway',
            'kitchen_status' => 'pending',
        ]);

        $liveOrdersResponse = $this->actingAs($this->branchUser)->get(route('live-orders.index'));
        $liveOrdersResponse->assertStatus(200);
        $liveOrdersResponse->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('stats.total_active', 1)
                ->where('orders.rows.0.order_type', 'Takeaway')
        );
    }

    /** @test */
    public function test_real_pos_checkout_creates_delivery_order()
    {
        $cat = \App\Models\MenuCategory::create(['name' => 'Mains']);
        $item = MenuItem::create(['menu_category_id' => $cat->id, 'name' => 'Burger', 'price' => 10.00, 'is_available' => true]);

        $checkoutResponse = $this->actingAs($this->branchUser)->post(route('pos.checkout'), [
            'order_type' => 'Delivery',
            'customer_name' => 'Charlie Delivery',
            'action' => 'settle',
            'payment_method' => 'Card',
            'items' => [
                ['menu_item_id' => $item->id, 'quantity' => 1, 'unit_price' => 10.00, 'subtotal' => 10.00]
            ]
        ]);

        $checkoutResponse->assertStatus(302);

        $this->assertDatabaseHas('pos_orders', [
            'customer_name' => 'Charlie Delivery',
            'order_type' => 'Delivery',
            'kitchen_status' => 'pending',
        ]);

        $liveOrdersResponse = $this->actingAs($this->branchUser)->get(route('live-orders.index'));
        $liveOrdersResponse->assertStatus(200);
        $liveOrdersResponse->assertInertia(fn ($page) =>
            $page->component('menu-pos/live-orders/index')
                ->where('stats.total_active', 1)
                ->where('orders.rows.0.order_type', 'Delivery')
        );
    }
}

<?php

namespace Tests\Feature;

use App\Models\BusinessLocation;
use App\Models\Country;
use App\Models\Ingredient;
use App\Models\IngredientCategory;
use App\Models\InternalRequest;
use App\Models\InventoryBalance;
use App\Models\InventoryLedger;
use App\Models\StorageLocation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchFilterTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected BusinessLocation $locFrom;
    protected BusinessLocation $locTo;
    protected StorageLocation $storageMain;
    protected StorageLocation $storageKitchen;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RoleSeeder::class);

        $country = Country::create(['name' => 'United States', 'status' => true]);

        $this->locFrom = BusinessLocation::create([
            'country_id' => $country->id,
            'location_name' => 'Main Store Location',
            'location_code' => 'LOC01',
            'location_type' => 'central_store',
        ]);

        $this->locTo = BusinessLocation::create([
            'country_id' => $country->id,
            'location_name' => 'Kitchen Location',
            'location_code' => 'LOC02',
            'location_type' => 'kitchen',
        ]);

        $this->storageMain = StorageLocation::create([
            'business_location_id' => $this->locTo->id,
            'storage_name' => 'Main Store',
            'storage_type' => 'dry',
            'status' => true,
        ]);

        $this->storageKitchen = StorageLocation::create([
            'business_location_id' => $this->locTo->id,
            'storage_name' => 'Main Kitchen',
            'storage_type' => 'cold',
            'status' => true,
        ]);

        $this->admin = User::factory()->create([
            'name' => 'System Admin',
            'business_location_id' => $this->locTo->id,
        ]);
        $this->admin->assignRole('admin');
        session(['active_location_id' => $this->locTo->id]);
    }

    /** @test */
    public function test_internal_request_filtering_by_from_location()
    {
        InternalRequest::create([
            'request_number' => 'REQ-1001',
            'from_location_id' => $this->locFrom->id,
            'to_location_id' => $this->locTo->id,
            'requested_by_id' => $this->admin->id,
            'status' => 'pending_fulfillment',
        ]);

        InternalRequest::create([
            'request_number' => 'REQ-1002',
            'from_location_id' => $this->locTo->id,
            'to_location_id' => $this->locTo->id,
            'requested_by_id' => $this->admin->id,
            'status' => 'fulfilled',
        ]);

        // Filter by fromLocation = locFrom->id
        $filtersJson = json_encode([
            ['id' => 'fromLocation', 'value' => [$this->locFrom->id]]
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('internal-requests.index', ['filters' => $filtersJson]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('purchasing/internal-requests/index')
                ->where('internalRequests.meta.total', 1)
                ->where('internalRequests.rows.0.request_number', 'REQ-1001')
        );
    }

    /** @test */
    public function test_search_and_filter_combination_groups_correctly()
    {
        InternalRequest::create([
            'request_number' => 'REQ-1001',
            'from_location_id' => $this->locFrom->id,
            'to_location_id' => $this->locTo->id,
            'requested_by_id' => $this->admin->id,
            'status' => 'pending_fulfillment',
        ]);

        InternalRequest::create([
            'request_number' => 'REQ-1002',
            'from_location_id' => $this->locFrom->id,
            'to_location_id' => $this->locTo->id,
            'requested_by_id' => $this->admin->id,
            'status' => 'fulfilled',
        ]);

        // Search: REQ-1002 AND Filter: status = fulfilled
        $filtersJson = json_encode([
            ['id' => 'status', 'value' => 'fulfilled']
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('internal-requests.index', ['search' => 'REQ-1002', 'filters' => $filtersJson]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('purchasing/internal-requests/index')
                ->where('internalRequests.meta.total', 1)
                ->where('internalRequests.rows.0.request_number', 'REQ-1002')
        );
    }

    /** @test */
    public function test_single_date_filter_matches_entire_calendar_day_with_half_open_range()
    {
        $cat = IngredientCategory::create(['name' => 'Dairy']);
        $ing = Ingredient::create([
            'name' => 'Butter',
            'code' => 'ING-BTR',
            'ingredient_category_id' => $cat->id,
            'is_inventory_item' => true,
        ]);

        // Create balance created at 2026-08-20 14:32:00
        $bal = InventoryBalance::create([
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'available_qty' => 10,
        ]);
        $bal->created_at = '2026-08-20 14:32:00';
        $bal->save();

        // Pass single date filter '2026-08-20'
        $filtersJson = json_encode([
            ['id' => 'created_at', 'value' => ['2026-08-20']]
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('live-stock.index', ['filters' => $filtersJson]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/live-stock/index')
                ->where('inventoryBalances.meta.total', 1)
        );
    }

    /** @test */
    public function test_numeric_looking_string_is_preserved_as_string()
    {
        InternalRequest::create([
            'request_number' => '1002',
            'from_location_id' => $this->locFrom->id,
            'to_location_id' => $this->locTo->id,
            'requested_by_id' => $this->admin->id,
            'status' => 'pending_fulfillment',
        ]);

        $filtersJson = json_encode([
            ['id' => 'request_number', 'value' => '1002']
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('internal-requests.index', ['filters' => $filtersJson]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('purchasing/internal-requests/index')
                ->where('internalRequests.meta.total', 1)
                ->where('internalRequests.rows.0.request_number', '1002')
        );
    }

    /** @test */
    public function test_live_stock_search_by_ingredient_name_matches_records()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing1 = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);
        $ing2 = Ingredient::create(['name' => 'Butter', 'code' => 'ING-BTR', 'ingredient_category_id' => $cat->id]);

        InventoryBalance::create(['storage_location_id' => $this->storageMain->id, 'ingredient_id' => $ing1->id, 'available_qty' => 100]);
        InventoryBalance::create(['storage_location_id' => $this->storageMain->id, 'ingredient_id' => $ing2->id, 'available_qty' => 50]);

        $response = $this->actingAs($this->admin)
            ->get(route('live-stock.index', ['search' => 'Ice']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/live-stock/index')
                ->where('inventoryBalances.meta.total', 1)
                ->where('inventoryBalances.rows.0.ingredient.name', 'Ice Cubes')
        );
    }

    /** @test */
    public function test_live_stock_search_by_ingredient_code_matches_records()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);
        InventoryBalance::create(['storage_location_id' => $this->storageMain->id, 'ingredient_id' => $ing->id, 'available_qty' => 100]);

        $response = $this->actingAs($this->admin)
            ->get(route('live-stock.index', ['search' => 'ING-ICE']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/live-stock/index')
                ->where('inventoryBalances.meta.total', 1)
                ->where('inventoryBalances.rows.0.ingredient.code', 'ING-ICE')
        );
    }

    /** @test */
    public function test_live_stock_search_by_storage_location_name_matches_records()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Salt', 'code' => 'ING-SLT', 'ingredient_category_id' => $cat->id]);

        InventoryBalance::create(['storage_location_id' => $this->storageKitchen->id, 'ingredient_id' => $ing->id, 'available_qty' => 10]);
        InventoryBalance::create(['storage_location_id' => $this->storageMain->id, 'ingredient_id' => $ing->id, 'available_qty' => 20]);

        $response = $this->actingAs($this->admin)
            ->get(route('live-stock.index', ['search' => 'Main Kitchen']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/live-stock/index')
                ->where('inventoryBalances.meta.total', 1)
                ->where('inventoryBalances.rows.0.storage_location.storage_name', 'Main Kitchen')
        );
    }

    /** @test */
    public function test_live_stock_search_by_category_name_matches_records()
    {
        $catBev = IngredientCategory::create(['name' => 'Beverages']);
        $catDairy = IngredientCategory::create(['name' => 'Dairy']);

        $ing1 = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $catBev->id]);
        $ing2 = Ingredient::create(['name' => 'Milk', 'code' => 'ING-MLK', 'ingredient_category_id' => $catDairy->id]);

        InventoryBalance::create(['storage_location_id' => $this->storageMain->id, 'ingredient_id' => $ing1->id, 'available_qty' => 10]);
        InventoryBalance::create(['storage_location_id' => $this->storageMain->id, 'ingredient_id' => $ing2->id, 'available_qty' => 10]);

        $response = $this->actingAs($this->admin)
            ->get(route('live-stock.index', ['search' => 'Beverages']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/live-stock/index')
                ->where('inventoryBalances.meta.total', 1)
                ->where('inventoryBalances.rows.0.ingredient.name', 'Ice Cubes')
        );
    }

    /** @test */
    public function test_live_stock_search_and_storage_location_filter_combination()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        InventoryBalance::create(['storage_location_id' => $this->storageKitchen->id, 'ingredient_id' => $ing->id, 'available_qty' => 340]);
        InventoryBalance::create(['storage_location_id' => $this->storageMain->id, 'ingredient_id' => $ing->id, 'available_qty' => 0]);

        // Search: Ice AND Filter: storage_location.storage_name = ["Main Kitchen"]
        $filtersJson = json_encode([
            ['id' => 'storage_location.storage_name', 'value' => ['Main Kitchen']]
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('live-stock.index', ['search' => 'Ice', 'filters' => $filtersJson]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/live-stock/index')
                ->where('inventoryBalances.meta.total', 1)
                ->where('inventoryBalances.rows.0.storage_location.storage_name', 'Main Kitchen')
        );
    }

    /** @test */
    public function test_inventory_ledger_search_by_ingredient_name()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing1 = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);
        $ing2 = Ingredient::create(['name' => 'Butter', 'code' => 'ING-BTR', 'ingredient_category_id' => $cat->id]);

        InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing1->id,
            'transaction_type' => 'purchase',
            'quantity' => 10,
            'running_balance' => 10,
            'created_by' => $this->admin->id,
        ]);

        InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing2->id,
            'transaction_type' => 'purchase',
            'quantity' => 5,
            'running_balance' => 5,
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['search' => 'Ice']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
                ->where('ledgers.rows.0.ingredient.name', 'Ice Cubes')
        );
    }

    /** @test */
    public function test_inventory_ledger_search_by_ingredient_code()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'purchase',
            'quantity' => 10,
            'running_balance' => 10,
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['search' => 'ING-ICE']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
                ->where('ledgers.rows.0.ingredient.code', 'ING-ICE')
        );
    }

    /** @test */
    public function test_inventory_ledger_search_by_storage_location()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Salt', 'code' => 'ING-SLT', 'ingredient_category_id' => $cat->id]);

        InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageKitchen->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'purchase',
            'quantity' => 10,
            'running_balance' => 10,
            'created_by' => $this->admin->id,
        ]);

        InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'purchase',
            'quantity' => 20,
            'running_balance' => 30,
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['search' => 'Main Kitchen']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
                ->where('ledgers.rows.0.storage_location_id', $this->storageKitchen->id)
        );
    }

    /** @test */
    public function test_inventory_ledger_search_by_transaction_type()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Salt', 'code' => 'ING-SLT', 'ingredient_category_id' => $cat->id]);

        InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'transfer_in',
            'quantity' => 10,
            'running_balance' => 10,
            'created_by' => $this->admin->id,
        ]);

        InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'consumption',
            'quantity' => -5,
            'running_balance' => 5,
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['search' => 'transfer_in']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
                ->where('ledgers.rows.0.transaction_type', 'transfer_in')
        );
    }

    /** @test */
    public function test_inventory_ledger_search_by_user()
    {
        $user2 = User::factory()->create([
            'name' => 'SpecialStaffUser',
            'business_location_id' => $this->locTo->id,
        ]);

        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Salt', 'code' => 'ING-SLT', 'ingredient_category_id' => $cat->id]);

        InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'purchase',
            'quantity' => 10,
            'running_balance' => 10,
            'created_by' => $user2->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['search' => 'SpecialStaffUser']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
                ->where('ledgers.rows.0.created_by.name', 'SpecialStaffUser')
        );
    }

    /** @test */
    public function test_inventory_ledger_search_and_transaction_type_filter_combination()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing1 = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing1->id,
            'transaction_type' => 'transfer_in',
            'quantity' => 10,
            'running_balance' => 10,
            'created_by' => $this->admin->id,
        ]);

        InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing1->id,
            'transaction_type' => 'consumption',
            'quantity' => -2,
            'running_balance' => 8,
            'created_by' => $this->admin->id,
        ]);

        // Search: Ice AND Filter: transaction_type = ["transfer_in"]
        $filtersJson = json_encode([
            ['id' => 'transaction_type', 'value' => ['transfer_in']]
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['search' => 'Ice', 'filters' => $filtersJson]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
                ->where('ledgers.rows.0.transaction_type', 'transfer_in')
                ->where('ledgers.rows.0.ingredient.name', 'Ice Cubes')
        );
    }

    /** @test */
    public function test_inventory_ledger_search_and_date_filter_combination()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        $l1 = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'purchase',
            'quantity' => 10,
            'running_balance' => 10,
            'created_by' => $this->admin->id,
        ]);
        $l1->created_at = '2026-08-20 10:00:00';
        $l1->save();

        $l2 = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'purchase',
            'quantity' => 5,
            'running_balance' => 15,
            'created_by' => $this->admin->id,
        ]);
        $l2->created_at = '2026-08-15 10:00:00';
        $l2->save();

        // Search: Ice AND Date Filter: 2026-08-20
        $filtersJson = json_encode([
            ['id' => 'created_at', 'value' => ['2026-08-20']]
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['search' => 'Ice', 'filters' => $filtersJson]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
        );
    }

    /** @test */
    public function test_inventory_ledger_hide_pos_sales_with_search()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'sale',
            'quantity' => -1,
            'running_balance' => 9,
            'created_by' => $this->admin->id,
        ]);

        InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'purchase',
            'quantity' => 10,
            'running_balance' => 10,
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['search' => 'Ice', 'hide_sales' => '1']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
                ->where('ledgers.rows.0.transaction_type', 'purchase')
        );
    }

    /** @test */
    public function test_inventory_ledger_total_entries_count_exceeding_page_size()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Salt', 'code' => 'ING-SLT', 'ingredient_category_id' => $cat->id]);

        for ($i = 0; $i < 15; $i++) {
            InventoryLedger::create([
                'business_location_id' => $this->locTo->id,
                'storage_location_id' => $this->storageMain->id,
                'ingredient_id' => $ing->id,
                'transaction_type' => 'purchase',
                'quantity' => 10,
                'running_balance' => 10 * ($i + 1),
                'created_by' => $this->admin->id,
            ]);
        }

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['perPage' => 10]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 15)
                ->where('ledgers.meta.perPage', 10)
        );
    }

    /** @test */
    public function test_inventory_ledger_filtered_total_entries_count()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ingIce = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);
        $ingButter = Ingredient::create(['name' => 'Butter', 'code' => 'ING-BTR', 'ingredient_category_id' => $cat->id]);

        for ($i = 0; $i < 10; $i++) {
            InventoryLedger::create([
                'business_location_id' => $this->locTo->id,
                'storage_location_id' => $this->storageMain->id,
                'ingredient_id' => $ingIce->id,
                'transaction_type' => 'purchase',
                'quantity' => 10,
                'running_balance' => 10,
                'created_by' => $this->admin->id,
            ]);
        }

        for ($i = 0; $i < 5; $i++) {
            InventoryLedger::create([
                'business_location_id' => $this->locTo->id,
                'storage_location_id' => $this->storageMain->id,
                'ingredient_id' => $ingButter->id,
                'transaction_type' => 'purchase',
                'quantity' => 5,
                'running_balance' => 5,
                'created_by' => $this->admin->id,
            ]);
        }

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['search' => 'Ice']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 10)
        );
    }

    /** @test */
    public function test_positive_storage_transfer_ledger_entry_is_inwards()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        $ledger = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageKitchen->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'storage_transfer',
            'quantity' => 20,
            'running_balance' => 20,
            'created_by' => $this->admin->id,
        ]);

        $this->assertEquals(20, (float)$ledger->quantity);
        $this->assertTrue((float)$ledger->quantity > 0);
    }

    /** @test */
    public function test_negative_storage_transfer_ledger_entry_is_outwards()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        $ledger = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'storage_transfer',
            'quantity' => -20,
            'running_balance' => 320,
            'created_by' => $this->admin->id,
        ]);

        $this->assertEquals(-20, (float)$ledger->quantity);
        $this->assertTrue((float)$ledger->quantity < 0);
    }

    /** @test */
    public function test_existing_transaction_types_classification_remains_unchanged()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        $l1 = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'purchase',
            'quantity' => 10,
            'running_balance' => 10,
            'created_by' => $this->admin->id,
        ]);

        $l2 = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'consumption',
            'quantity' => -2,
            'running_balance' => 8,
            'created_by' => $this->admin->id,
        ]);

        $this->assertTrue((float)$l1->quantity > 0);
        $this->assertTrue((float)$l2->quantity < 0);
    }

    /** @test */
    public function test_inventory_ledger_search_plus_movement_inwards()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ingIce = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);
        $ingButter = Ingredient::create(['name' => 'Butter', 'code' => 'ING-BTR', 'ingredient_category_id' => $cat->id]);

        InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ingIce->id,
            'transaction_type' => 'purchase',
            'quantity' => 20,
            'running_balance' => 20,
            'created_by' => $this->admin->id,
        ]);

        InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ingIce->id,
            'transaction_type' => 'consumption',
            'quantity' => -20,
            'running_balance' => 0,
            'created_by' => $this->admin->id,
        ]);

        InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ingButter->id,
            'transaction_type' => 'purchase',
            'quantity' => 10,
            'running_balance' => 10,
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['search' => 'Ice', 'movement' => 'inwards']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
                ->where('ledgers.rows.0.ingredient.name', 'Ice Cubes')
                ->where('ledgers.rows.0.quantity', 20)
        );
    }

    /** @test */
    public function test_inventory_ledger_server_side_movement_pagination()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Salt', 'code' => 'ING-SLT', 'ingredient_category_id' => $cat->id]);

        for ($i = 0; $i < 15; $i++) {
            InventoryLedger::create([
                'business_location_id' => $this->locTo->id,
                'storage_location_id' => $this->storageMain->id,
                'ingredient_id' => $ing->id,
                'transaction_type' => 'purchase',
                'quantity' => 10,
                'running_balance' => 10 * ($i + 1),
                'created_by' => $this->admin->id,
            ]);
        }

        for ($i = 0; $i < 10; $i++) {
            InventoryLedger::create([
                'business_location_id' => $this->locTo->id,
                'storage_location_id' => $this->storageMain->id,
                'ingredient_id' => $ing->id,
                'transaction_type' => 'consumption',
                'quantity' => -1,
                'running_balance' => 10,
                'created_by' => $this->admin->id,
            ]);
        }

        // Test Inwards: total = 15, lastPage = 2
        $resInwards = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['movement' => 'inwards', 'perPage' => 10]));
        $resInwards->assertStatus(200);
        $resInwards->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 15)
                ->where('ledgers.meta.lastPage', 2)
        );

        // Test Outwards: total = 10, lastPage = 1
        $resOutwards = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['movement' => 'outwards', 'perPage' => 10]));
        $resOutwards->assertStatus(200);
        $resOutwards->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 10)
                ->where('ledgers.meta.lastPage', 1)
        );
    }

    /** @test */
    public function test_inventory_ledger_search_plus_movement_plus_pagination()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ingIce = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);
        $ingButter = Ingredient::create(['name' => 'Butter', 'code' => 'ING-BTR', 'ingredient_category_id' => $cat->id]);

        for ($i = 0; $i < 20; $i++) {
            InventoryLedger::create([
                'business_location_id' => $this->locTo->id,
                'storage_location_id' => $this->storageMain->id,
                'ingredient_id' => $ingIce->id,
                'transaction_type' => 'purchase',
                'quantity' => 10,
                'running_balance' => 10,
                'created_by' => $this->admin->id,
            ]);
        }

        for ($i = 0; $i < 10; $i++) {
            InventoryLedger::create([
                'business_location_id' => $this->locTo->id,
                'storage_location_id' => $this->storageMain->id,
                'ingredient_id' => $ingIce->id,
                'transaction_type' => 'consumption',
                'quantity' => -2,
                'running_balance' => 8,
                'created_by' => $this->admin->id,
            ]);
        }

        for ($i = 0; $i < 5; $i++) {
            InventoryLedger::create([
                'business_location_id' => $this->locTo->id,
                'storage_location_id' => $this->storageMain->id,
                'ingredient_id' => $ingButter->id,
                'transaction_type' => 'purchase',
                'quantity' => 5,
                'running_balance' => 5,
                'created_by' => $this->admin->id,
            ]);
        }

        // Search: Ice + Movement: inwards + perPage: 10
        // Page 1
        $resPage1 = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['search' => 'Ice', 'movement' => 'inwards', 'perPage' => 10, 'page' => 1]));
        $resPage1->assertStatus(200);
        $resPage1->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 20)
                ->where('ledgers.meta.lastPage', 2)
                ->where('ledgers.meta.currentPage', 1)
        );

        // Page 2
        $resPage2 = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['search' => 'Ice', 'movement' => 'inwards', 'perPage' => 10, 'page' => 2]));
        $resPage2->assertStatus(200);
        $resPage2->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 20)
                ->where('ledgers.meta.currentPage', 2)
        );
    }

    /** @test */
    public function test_inventory_ledger_date_plus_movement_inwards()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        $l1 = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'purchase',
            'quantity' => 10,
            'running_balance' => 10,
            'created_by' => $this->admin->id,
        ]);
        $l1->created_at = '2026-08-20 10:00:00';
        $l1->save();

        $l2 = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'consumption',
            'quantity' => -2,
            'running_balance' => 8,
            'created_by' => $this->admin->id,
        ]);
        $l2->created_at = '2026-08-20 12:00:00';
        $l2->save();

        $filtersJson = json_encode([
            ['id' => 'created_at', 'value' => ['2026-08-20']]
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['filters' => $filtersJson, 'movement' => 'inwards']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
                ->where('ledgers.rows.0.quantity', 10)
        );
    }

    /** @test */
    public function test_inventory_ledger_transaction_type_plus_movement_inwards()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageKitchen->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'storage_transfer',
            'quantity' => 20,
            'running_balance' => 20,
            'created_by' => $this->admin->id,
        ]);

        InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'storage_transfer',
            'quantity' => -20,
            'running_balance' => 320,
            'created_by' => $this->admin->id,
        ]);

        $filtersJson = json_encode([
            ['id' => 'transaction_type', 'value' => ['storage_transfer']]
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['filters' => $filtersJson, 'movement' => 'inwards']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
                ->where('ledgers.rows.0.storage_location_id', $this->storageKitchen->id)
                ->where('ledgers.rows.0.quantity', 20)
        );
    }

    /** @test */
    public function test_initial_ledger_request_defaults_to_todays_records_and_excludes_yesterday()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        $today = now()->format('Y-m-d');
        $yesterday = now()->subDay()->format('Y-m-d');

        $lToday = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'purchase',
            'quantity' => 10,
            'running_balance' => 10,
            'created_by' => $this->admin->id,
        ]);
        $lToday->created_at = $today . ' 10:00:00';
        $lToday->save();

        $lYesterday = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'purchase',
            'quantity' => 5,
            'running_balance' => 5,
            'created_by' => $this->admin->id,
        ]);
        $lYesterday->created_at = $yesterday . ' 10:00:00';
        $lYesterday->save();

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
                ->where('ledgers.rows.0.id', $lToday->id)
        );
    }

    /** @test */
    public function test_explicit_single_date_filter_overrides_today_default()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        $yesterday = now()->subDay()->format('Y-m-d');

        $lYesterday = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'purchase',
            'quantity' => 5,
            'running_balance' => 5,
            'created_by' => $this->admin->id,
        ]);
        $lYesterday->created_at = $yesterday . ' 10:00:00';
        $lYesterday->save();

        $filtersJson = json_encode([
            ['id' => 'created_at', 'value' => [$yesterday, $yesterday]]
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['filters' => $filtersJson]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
                ->where('ledgers.rows.0.id', $lYesterday->id)
        );
    }

    /** @test */
    public function test_explicit_date_range_filter_overrides_today_default()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        $lOld = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'purchase',
            'quantity' => 5,
            'running_balance' => 5,
            'created_by' => $this->admin->id,
        ]);
        $lOld->created_at = '2026-08-15 10:00:00';
        $lOld->save();

        $filtersJson = json_encode([
            ['id' => 'created_at', 'value' => ['2026-08-10', '2026-08-18']]
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['filters' => $filtersJson]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
                ->where('ledgers.rows.0.id', $lOld->id)
        );
    }

    /** @test */
    public function test_search_plus_today_default()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ingIce = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        $today = now()->format('Y-m-d');
        $yesterday = now()->subDay()->format('Y-m-d');

        $lToday = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ingIce->id,
            'transaction_type' => 'purchase',
            'quantity' => 10,
            'running_balance' => 10,
            'created_by' => $this->admin->id,
        ]);
        $lToday->created_at = $today . ' 10:00:00';
        $lToday->save();

        $lYesterday = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ingIce->id,
            'transaction_type' => 'purchase',
            'quantity' => 5,
            'running_balance' => 5,
            'created_by' => $this->admin->id,
        ]);
        $lYesterday->created_at = $yesterday . ' 10:00:00';
        $lYesterday->save();

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['search' => 'Ice']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
                ->where('ledgers.rows.0.id', $lToday->id)
        );
    }

    /** @test */
    public function test_inwards_movement_plus_today_default()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        $today = now()->format('Y-m-d');
        $yesterday = now()->subDay()->format('Y-m-d');

        $lToday = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'purchase',
            'quantity' => 10,
            'running_balance' => 10,
            'created_by' => $this->admin->id,
        ]);
        $lToday->created_at = $today . ' 10:00:00';
        $lToday->save();

        $lYesterday = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'purchase',
            'quantity' => 5,
            'running_balance' => 5,
            'created_by' => $this->admin->id,
        ]);
        $lYesterday->created_at = $yesterday . ' 10:00:00';
        $lYesterday->save();

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['movement' => 'inwards']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
                ->where('ledgers.rows.0.id', $lToday->id)
        );
    }

    /** @test */
    public function test_outwards_movement_plus_today_default()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        $today = now()->format('Y-m-d');
        $yesterday = now()->subDay()->format('Y-m-d');

        $lToday = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'consumption',
            'quantity' => -2,
            'running_balance' => 8,
            'created_by' => $this->admin->id,
        ]);
        $lToday->created_at = $today . ' 10:00:00';
        $lToday->save();

        $lYesterday = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'consumption',
            'quantity' => -1,
            'running_balance' => 9,
            'created_by' => $this->admin->id,
        ]);
        $lYesterday->created_at = $yesterday . ' 10:00:00';
        $lYesterday->save();

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['movement' => 'outwards']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
                ->where('ledgers.rows.0.id', $lToday->id)
        );
    }

    /** @test */
    public function test_transaction_type_plus_today_default()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        $today = now()->format('Y-m-d');
        $yesterday = now()->subDay()->format('Y-m-d');

        $lToday = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'storage_transfer',
            'quantity' => 10,
            'running_balance' => 10,
            'created_by' => $this->admin->id,
        ]);
        $lToday->created_at = $today . ' 10:00:00';
        $lToday->save();

        $lYesterday = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'storage_transfer',
            'quantity' => 5,
            'running_balance' => 5,
            'created_by' => $this->admin->id,
        ]);
        $lYesterday->created_at = $yesterday . ' 10:00:00';
        $lYesterday->save();

        $filtersJson = json_encode([
            ['id' => 'transaction_type', 'value' => ['storage_transfer']]
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['filters' => $filtersJson]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
                ->where('ledgers.rows.0.id', $lToday->id)
        );
    }

    /** @test */
    public function test_hide_pos_sales_plus_today_default()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        $today = now()->format('Y-m-d');

        $lPurchase = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'purchase',
            'quantity' => 10,
            'running_balance' => 10,
            'created_by' => $this->admin->id,
        ]);
        $lPurchase->created_at = $today . ' 10:00:00';
        $lPurchase->save();

        $lSale = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'sale',
            'quantity' => -1,
            'running_balance' => 9,
            'created_by' => $this->admin->id,
        ]);
        $lSale->created_at = $today . ' 11:00:00';
        $lSale->save();

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['hide_sales' => '1']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 1)
                ->where('ledgers.rows.0.id', $lPurchase->id)
        );
    }

    /** @test */
    public function test_cleared_date_all_dates_allows_access_to_historical_records()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        $today = now()->format('Y-m-d');
        $yesterday = now()->subDay()->format('Y-m-d');

        $lToday = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'purchase',
            'quantity' => 10,
            'running_balance' => 10,
            'created_by' => $this->admin->id,
        ]);
        $lToday->created_at = $today . ' 10:00:00';
        $lToday->save();

        $lYesterday = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'purchase',
            'quantity' => 5,
            'running_balance' => 5,
            'created_by' => $this->admin->id,
        ]);
        $lYesterday->created_at = $yesterday . ' 10:00:00';
        $lYesterday->save();

        $response = $this->actingAs($this->admin)
            ->get(route('ledger.index', ['all_dates' => '1']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('ledgers.meta.total', 2)
        );
    }

    /** @test */
    public function test_dashboard_summary_counts_follow_active_search_and_date_context()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ingIce = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);
        $ingButter = Ingredient::create(['name' => 'Butter', 'code' => 'ING-BTR', 'ingredient_category_id' => $cat->id]);

        $today = now()->format('Y-m-d');
        $yesterday = now()->subDay()->format('Y-m-d');

        for ($i = 0; $i < 10; $i++) {
            $l = InventoryLedger::create([
                'business_location_id' => $this->locTo->id,
                'storage_location_id' => $this->storageMain->id,
                'ingredient_id' => $ingIce->id,
                'transaction_type' => 'purchase',
                'quantity' => 10,
                'running_balance' => 10,
                'created_by' => $this->admin->id,
            ]);
            $l->created_at = $today . ' 10:00:00';
            $l->save();
        }

        for ($i = 0; $i < 5; $i++) {
            $l = InventoryLedger::create([
                'business_location_id' => $this->locTo->id,
                'storage_location_id' => $this->storageMain->id,
                'ingredient_id' => $ingButter->id,
                'transaction_type' => 'purchase',
                'quantity' => 5,
                'running_balance' => 5,
                'created_by' => $this->admin->id,
            ]);
            $l->created_at = $today . ' 10:00:00';
            $l->save();
        }

        for ($i = 0; $i < 3; $i++) {
            $l = InventoryLedger::create([
                'business_location_id' => $this->locTo->id,
                'storage_location_id' => $this->storageMain->id,
                'ingredient_id' => $ingIce->id,
                'transaction_type' => 'purchase',
                'quantity' => 10,
                'running_balance' => 10,
                'created_by' => $this->admin->id,
            ]);
            $l->created_at = $yesterday . ' 10:00:00';
            $l->save();
        }

        // Today default (no search) -> total 15
        $r1 = $this->actingAs($this->admin)->get(route('ledger.index'));
        $r1->assertStatus(200);
        $r1->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('serverStats.total', 15)
                ->where('serverStats.inwards', 15)
        );

        // Today default + Search Ice -> total 10
        $r2 = $this->actingAs($this->admin)->get(route('ledger.index', ['search' => 'Ice']));
        $r2->assertStatus(200);
        $r2->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('serverStats.total', 10)
                ->where('serverStats.inwards', 10)
        );

        // All dates + Search Ice -> total 13
        $r3 = $this->actingAs($this->admin)->get(route('ledger.index', ['all_dates' => '1', 'search' => 'Ice']));
        $r3->assertStatus(200);
        $r3->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('serverStats.total', 13)
                ->where('serverStats.inwards', 13)
        );
    }

    /** @test */
    public function test_server_stats_are_independent_of_page_size_and_movement_tab()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Ice Cubes', 'code' => 'ING-ICE', 'ingredient_category_id' => $cat->id]);

        $today = now()->format('Y-m-d');

        for ($i = 0; $i < 15; $i++) {
            $l = InventoryLedger::create([
                'business_location_id' => $this->locTo->id,
                'storage_location_id' => $this->storageMain->id,
                'ingredient_id' => $ing->id,
                'transaction_type' => 'purchase',
                'quantity' => 10,
                'running_balance' => 10,
                'created_by' => $this->admin->id,
            ]);
            $l->created_at = $today . ' 10:00:00';
            $l->save();
        }

        for ($i = 0; $i < 10; $i++) {
            $l = InventoryLedger::create([
                'business_location_id' => $this->locTo->id,
                'storage_location_id' => $this->storageMain->id,
                'ingredient_id' => $ing->id,
                'transaction_type' => 'consumption',
                'quantity' => -2,
                'running_balance' => 8,
                'created_by' => $this->admin->id,
            ]);
            $l->created_at = $today . ' 11:00:00';
            $l->save();
        }

        // perPage=10 -> serverStats total=25, inwards=15, outwards=10
        $r1 = $this->actingAs($this->admin)->get(route('ledger.index', ['perPage' => 10]));
        $r1->assertStatus(200);
        $r1->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('serverStats.total', 25)
                ->where('serverStats.inwards', 15)
                ->where('serverStats.outwards', 10)
        );

        // movement=inwards -> serverStats remains total=25, inwards=15, outwards=10 (while table rows total=15)
        $r2 = $this->actingAs($this->admin)->get(route('ledger.index', ['perPage' => 10, 'movement' => 'inwards']));
        $r2->assertStatus(200);
        $r2->assertInertia(fn ($page) => 
            $page->component('inventory/ledger/index')
                ->where('serverStats.total', 25)
                ->where('serverStats.inwards', 15)
                ->where('serverStats.outwards', 10)
                ->where('ledgers.meta.total', 15)
        );
    }

    /** @test */
    public function test_daily_consumption_defaults_to_todays_sales_consumption()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Sugar', 'code' => 'ING-SGR', 'ingredient_category_id' => $cat->id]);

        $today = now()->format('Y-m-d');
        $yesterday = now()->subDay()->format('Y-m-d');

        $lToday = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'sale',
            'quantity' => -10,
            'running_balance' => 90,
            'reference_type' => 'App\Models\Order',
            'reference_id' => 'ord-today-1',
            'created_by' => $this->admin->id,
        ]);
        $lToday->created_at = $today . ' 10:00:00';
        $lToday->save();

        $lYesterday = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'sale',
            'quantity' => -5,
            'running_balance' => 95,
            'reference_type' => 'App\Models\Order',
            'reference_id' => 'ord-yesterday-1',
            'created_by' => $this->admin->id,
        ]);
        $lYesterday->created_at = $yesterday . ' 10:00:00';
        $lYesterday->save();

        // Default GET /inventory/consumption -> returns today's record (quantity 10) and excludes yesterday
        $res = $this->actingAs($this->admin)->get(route('consumption.index'));
        $res->assertStatus(200);
        $res->assertInertia(fn ($page) => 
            $page->component('inventory/consumption/index')
                ->where('consumptions.0.total_consumed', 10)
                ->where('filters.start_date', $today)
                ->where('filters.all_dates', false)
        );
    }

    /** @test */
    public function test_daily_consumption_explicit_date_and_date_range()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Flour', 'code' => 'ING-FLR', 'ingredient_category_id' => $cat->id]);

        $pastDate = now()->subDays(5)->format('Y-m-d');

        $lPast = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'sale',
            'quantity' => -20,
            'running_balance' => 80,
            'reference_type' => 'App\Models\Order',
            'reference_id' => 'ord-past-1',
            'created_by' => $this->admin->id,
        ]);
        $lPast->created_at = $pastDate . ' 12:00:00';
        $lPast->save();

        // Explicit date query start_date=pastDate & end_date=pastDate
        $res = $this->actingAs($this->admin)->get(route('consumption.index', [
            'start_date' => $pastDate,
            'end_date' => $pastDate,
        ]));
        $res->assertStatus(200);
        $res->assertInertia(fn ($page) => 
            $page->component('inventory/consumption/index')
                ->where('consumptions.0.total_consumed', 20)
                ->where('filters.start_date', $pastDate)
                ->where('filters.end_date', $pastDate)
        );
    }

    /** @test */
    public function test_daily_consumption_all_dates_cleared_returns_historical_records()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Salt', 'code' => 'ING-SLT', 'ingredient_category_id' => $cat->id]);

        $today = now()->format('Y-m-d');
        $yesterday = now()->subDay()->format('Y-m-d');

        $lToday = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'sale',
            'quantity' => -10,
            'running_balance' => 90,
            'reference_type' => 'App\Models\Order',
            'reference_id' => 'ord-today-salt',
            'created_by' => $this->admin->id,
        ]);
        $lToday->created_at = $today . ' 10:00:00';
        $lToday->save();

        $lYesterday = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'sale',
            'quantity' => -15,
            'running_balance' => 75,
            'reference_type' => 'App\Models\Order',
            'reference_id' => 'ord-yesterday-salt',
            'created_by' => $this->admin->id,
        ]);
        $lYesterday->created_at = $yesterday . ' 10:00:00';
        $lYesterday->save();

        // GET /inventory/consumption?all_dates=1 -> returns total_consumed = 25 (10 + 15)
        $res = $this->actingAs($this->admin)->get(route('consumption.index', ['all_dates' => '1']));
        $res->assertStatus(200);
        $res->assertInertia(fn ($page) => 
            $page->component('inventory/consumption/index')
                ->where('consumptions.0.total_consumed', 25)
                ->where('filters.all_dates', true)
        );
    }

    /** @test */
    public function test_daily_consumption_all_dates_respects_branch_isolation()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $ing = Ingredient::create(['name' => 'Pepper', 'code' => 'ING-PPR', 'ingredient_category_id' => $cat->id]);

        $yesterday = now()->subDay()->format('Y-m-d');

        // Location 1 record
        $lLoc1 = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'sale',
            'quantity' => -8,
            'running_balance' => 92,
            'reference_type' => 'App\Models\Order',
            'reference_id' => 'ord-loc1',
            'created_by' => $this->admin->id,
        ]);
        $lLoc1->created_at = $yesterday . ' 10:00:00';
        $lLoc1->save();

        // Location 2 record
        $lLoc2 = InventoryLedger::create([
            'business_location_id' => $this->locFrom->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'sale',
            'quantity' => -50,
            'running_balance' => 50,
            'reference_type' => 'App\Models\Order',
            'reference_id' => 'ord-loc2',
            'created_by' => $this->admin->id,
        ]);
        $lLoc2->created_at = $yesterday . ' 10:00:00';
        $lLoc2->save();

        // Non-admin user assigned to locTo requesting all_dates=1
        $manager = \App\Models\User::factory()->create([
            'business_location_id' => $this->locTo->id,
        ]);

        $res = $this->actingAs($manager)->get(route('consumption.index', ['all_dates' => '1']));
        $res->assertStatus(200);
        $res->assertInertia(fn ($page) => 
            $page->component('inventory/consumption/index')
                ->where('consumptions.0.total_consumed', 8)
        );
    }

    /** @test */
    public function test_daily_consumption_preferred_supplier_cost_calculation()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $uomEA = \App\Models\UnitOfMeasure::create(['name' => 'Each', 'code' => 'EA', 'type' => 'Unit', 'status' => 1]);
        $ing = Ingredient::create(['name' => 'Steak', 'code' => 'ING-STK', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uomEA->id]);
        $supplier = \App\Models\Supplier::create(['name' => 'Prime Meat Co', 'status' => 1]);

        \App\Models\IngredientSupplier::create([
            'ingredient_id' => $ing->id,
            'supplier_id' => $supplier->id,
            'purchase_uom_id' => $uomEA->id,
            'price' => 15.00,
            'is_preferred' => true,
            'status' => true,
        ]);

        $today = now()->format('Y-m-d');
        $l = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'sale',
            'quantity' => -4,
            'running_balance' => 96,
            'reference_type' => 'App\Models\Order',
            'reference_id' => 'ord-cost-1',
            'created_by' => $this->admin->id,
        ]);
        $l->created_at = $today . ' 10:00:00';
        $l->save();

        // 4 EA consumed * $15.00/EA = $60.00 total_cost
        $res = $this->actingAs($this->admin)->get(route('consumption.index'));
        $res->assertStatus(200);
        $res->assertInertia(fn ($page) => 
            $page->component('inventory/consumption/index')
                ->where('consumptions.0.total_consumed', 4)
                ->where('consumptions.0.total_cost', 60)
        );
    }

    /** @test */
    public function test_daily_consumption_uom_conversion_cost_calculation()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $uomEA = \App\Models\UnitOfMeasure::create(['name' => 'Each', 'code' => 'EA', 'type' => 'Unit', 'status' => 1]);
        $uomBox = \App\Models\UnitOfMeasure::create([
            'name' => 'Box 10x',
            'code' => 'BX',
            'type' => 'Unit',
            'base_unit_id' => $uomEA->id,
            'conversion_factor' => 10.0,
            'status' => 1,
        ]);

        $ing = Ingredient::create(['name' => 'Burger Patty', 'code' => 'ING-PTY', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uomEA->id]);
        $supplier = \App\Models\Supplier::create(['name' => 'Patty Wholesale', 'status' => 1]);

        // Purchase price: $20.00 per Box (10 EA) -> $2.00 per EA base cost
        \App\Models\IngredientSupplier::create([
            'ingredient_id' => $ing->id,
            'supplier_id' => $supplier->id,
            'purchase_uom_id' => $uomBox->id,
            'price' => 20.00,
            'is_preferred' => true,
            'status' => true,
        ]);

        $today = now()->format('Y-m-d');
        $l = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'sale',
            'quantity' => -3, // 3 EA consumed
            'running_balance' => 97,
            'reference_type' => 'App\Models\Order',
            'reference_id' => 'ord-cost-uom',
            'created_by' => $this->admin->id,
        ]);
        $l->created_at = $today . ' 10:00:00';
        $l->save();

        // 3 EA consumed * ($20.00 / 10) = 3 * 2.00 = $6.00 total_cost
        $res = $this->actingAs($this->admin)->get(route('consumption.index'));
        $res->assertStatus(200);
        $res->assertInertia(fn ($page) => 
            $page->component('inventory/consumption/index')
                ->where('consumptions.0.total_consumed', 3)
                ->where('consumptions.0.total_cost', 6)
        );
    }

    /** @test */
    public function test_daily_consumption_fallback_to_non_preferred_supplier_and_po_history()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $uomEA = \App\Models\UnitOfMeasure::create(['name' => 'Each', 'code' => 'EA', 'type' => 'Unit', 'status' => 1]);

        // Ingredient 1: Non-preferred supplier fallback ($5.00/EA)
        $ing1 = Ingredient::create(['name' => 'Cheese', 'code' => 'ING-CHS', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uomEA->id]);
        $supplier1 = \App\Models\Supplier::create(['name' => 'Dairy Co', 'status' => 1]);
        \App\Models\IngredientSupplier::create([
            'ingredient_id' => $ing1->id,
            'supplier_id' => $supplier1->id,
            'purchase_uom_id' => $uomEA->id,
            'price' => 5.00,
            'is_preferred' => false,
            'status' => true,
        ]);

        // Ingredient 2: PO Item history fallback ($8.00/EA)
        $ing2 = Ingredient::create(['name' => 'Bacon', 'code' => 'ING-BCN', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uomEA->id]);
        $po = \App\Models\PurchaseOrder::create([
            'po_number' => 'PO-TEST-1',
            'supplier_id' => $supplier1->id,
            'business_location_id' => $this->locTo->id,
            'status' => 'received',
            'subtotal' => 100,
            'tax_total' => 0,
            'grand_total' => 100,
            'created_by' => $this->admin->id,
        ]);
        \App\Models\PurchaseOrderItem::create([
            'purchase_order_id' => $po->id,
            'ingredient_id' => $ing2->id,
            'purchase_uom_id' => $uomEA->id,
            'quantity' => 10,
            'received_quantity' => 10,
            'unit_price' => 8.00,
        ]);

        // Ingredient 3: No cost data (safely 0.00)
        $ing3 = Ingredient::create(['name' => 'Water', 'code' => 'ING-WTR', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uomEA->id]);

        $today = now()->format('Y-m-d');
        foreach ([[$ing1, -2], [$ing2, -5], [$ing3, -10]] as [$ing, $qty]) {
            $l = InventoryLedger::create([
                'business_location_id' => $this->locTo->id,
                'storage_location_id' => $this->storageMain->id,
                'ingredient_id' => $ing->id,
                'transaction_type' => 'sale',
                'quantity' => $qty,
                'running_balance' => 90,
                'reference_type' => 'App\Models\Order',
                'reference_id' => 'ord-fallback-' . $ing->id,
                'created_by' => $this->admin->id,
            ]);
            $l->created_at = $today . ' 10:00:00';
            $l->save();
        }

        $res = $this->actingAs($this->admin)->get(route('consumption.index'));
        $res->assertStatus(200);

        // Ing1: 2 * $5.00 = $10.00
        // Ing2: 5 * $8.00 = $40.00
        // Ing3: 10 * $0.00 = $0.00
        $res->assertInertia(fn ($page) => 
            $page->component('inventory/consumption/index')
                ->where('consumptions.0.total_cost', 10)
                ->where('consumptions.1.total_cost', 40)
                ->where('consumptions.2.total_cost', 0)
        );
    }

    /** @test */
    public function test_daily_consumption_global_total_orders_one_order_multiple_ingredients()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $uom = \App\Models\UnitOfMeasure::create(['name' => 'Each', 'code' => 'EA', 'type' => 'Unit', 'status' => 1]);

        $bun = Ingredient::create(['name' => 'Bun', 'code' => 'ING-BN1', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id]);
        $patty = Ingredient::create(['name' => 'Patty', 'code' => 'ING-PT1', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id]);
        $cheese = Ingredient::create(['name' => 'Cheese', 'code' => 'ING-CH1', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id]);

        $today = now()->format('Y-m-d');
        // Single order (ORD-MULT-1) containing 3 ingredients
        foreach ([$bun, $patty, $cheese] as $ing) {
            $l = InventoryLedger::create([
                'business_location_id' => $this->locTo->id,
                'storage_location_id' => $this->storageMain->id,
                'ingredient_id' => $ing->id,
                'transaction_type' => 'sale',
                'quantity' => -1,
                'running_balance' => 99,
                'reference_type' => 'App\Models\Order',
                'reference_id' => 'ORD-MULT-1',
                'created_by' => $this->admin->id,
            ]);
            $l->created_at = $today . ' 10:00:00';
            $l->save();
        }

        $res = $this->actingAs($this->admin)->get(route('consumption.index'));
        $res->assertStatus(200);
        $res->assertInertia(fn ($page) => 
            $page->component('inventory/consumption/index')
                ->where('globalTotalOrders', 1)
                ->where('consumptions.0.total_orders', 1)
                ->where('consumptions.1.total_orders', 1)
                ->where('consumptions.2.total_orders', 1)
        );
    }

    /** @test */
    public function test_daily_consumption_global_total_orders_multiple_orders_overlapping_ingredients()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $uom = \App\Models\UnitOfMeasure::create(['name' => 'Each', 'code' => 'EA', 'type' => 'Unit', 'status' => 1]);

        $bun = Ingredient::create(['name' => 'Bun', 'code' => 'ING-BN2', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id]);
        $patty = Ingredient::create(['name' => 'Patty', 'code' => 'ING-PT2', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id]);
        $cheese = Ingredient::create(['name' => 'Cheese', 'code' => 'ING-CH2', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id]);

        $today = now()->format('Y-m-d');
        // Order 1: Bun, Patty, Cheese
        // Order 2: Bun, Patty
        // Order 3: Bun, Patty, Cheese
        $orderSpecs = [
            'ORD-OVR-1' => [$bun, $patty, $cheese],
            'ORD-OVR-2' => [$bun, $patty],
            'ORD-OVR-3' => [$bun, $patty, $cheese],
        ];

        foreach ($orderSpecs as $ordId => $ings) {
            foreach ($ings as $ing) {
                $l = InventoryLedger::create([
                    'business_location_id' => $this->locTo->id,
                    'storage_location_id' => $this->storageMain->id,
                    'ingredient_id' => $ing->id,
                    'transaction_type' => 'sale',
                    'quantity' => -1,
                    'running_balance' => 95,
                    'reference_type' => 'App\Models\Order',
                    'reference_id' => $ordId,
                    'created_by' => $this->admin->id,
                ]);
                $l->created_at = $today . ' 11:00:00';
                $l->save();
            }
        }

        $res = $this->actingAs($this->admin)->get(route('consumption.index'));
        $res->assertStatus(200);
        $res->assertInertia(fn ($page) => 
            $page->component('inventory/consumption/index')
                ->where('globalTotalOrders', 3)
                ->where('consumptions.0.total_orders', 3) // Bun: 3 orders
                ->where('consumptions.1.total_orders', 3) // Patty: 3 orders
                ->where('consumptions.2.total_orders', 2) // Cheese: 2 orders
        );
    }

    /** @test */
    public function test_daily_consumption_global_total_orders_date_filter()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $uom = \App\Models\UnitOfMeasure::create(['name' => 'Each', 'code' => 'EA', 'type' => 'Unit', 'status' => 1]);
        $ing = Ingredient::create(['name' => 'Sauce', 'code' => 'ING-SCE', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id]);

        $today = now()->format('Y-m-d');
        $yesterday = now()->subDay()->format('Y-m-d');

        // Order today
        $lToday = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'sale',
            'quantity' => -1,
            'running_balance' => 99,
            'reference_type' => 'App\Models\Order',
            'reference_id' => 'ORD-DATE-TODAY',
            'created_by' => $this->admin->id,
        ]);
        $lToday->created_at = $today . ' 12:00:00';
        $lToday->save();

        // Order yesterday
        $lYest = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'sale',
            'quantity' => -1,
            'running_balance' => 98,
            'reference_type' => 'App\Models\Order',
            'reference_id' => 'ORD-DATE-YEST',
            'created_by' => $this->admin->id,
        ]);
        $lYest->created_at = $yesterday . ' 12:00:00';
        $lYest->save();

        $res = $this->actingAs($this->admin)->get(route('consumption.index'));
        $res->assertStatus(200);
        $res->assertInertia(fn ($page) => 
            $page->component('inventory/consumption/index')
                ->where('globalTotalOrders', 1)
        );
    }

    /** @test */
    public function test_daily_consumption_global_total_orders_all_dates()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $uom = \App\Models\UnitOfMeasure::create(['name' => 'Each', 'code' => 'EA', 'type' => 'Unit', 'status' => 1]);
        $ing = Ingredient::create(['name' => 'Fries', 'code' => 'ING-FRS', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id]);

        $today = now()->format('Y-m-d');
        $oldDate = now()->subDays(10)->format('Y-m-d');

        foreach ([['ORD-ALL-1', $today], ['ORD-ALL-2', $oldDate]] as [$ordId, $dt]) {
            $l = InventoryLedger::create([
                'business_location_id' => $this->locTo->id,
                'storage_location_id' => $this->storageMain->id,
                'ingredient_id' => $ing->id,
                'transaction_type' => 'sale',
                'quantity' => -1,
                'running_balance' => 90,
                'reference_type' => 'App\Models\Order',
                'reference_id' => $ordId,
                'created_by' => $this->admin->id,
            ]);
            $l->created_at = $dt . ' 14:00:00';
            $l->save();
        }

        $res = $this->actingAs($this->admin)->get(route('consumption.index', ['all_dates' => 1]));
        $res->assertStatus(200);
        $res->assertInertia(fn ($page) => 
            $page->component('inventory/consumption/index')
                ->where('globalTotalOrders', 2)
        );
    }

    /** @test */
    public function test_daily_consumption_global_total_orders_business_location_isolation()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $uom = \App\Models\UnitOfMeasure::create(['name' => 'Each', 'code' => 'EA', 'type' => 'Unit', 'status' => 1]);
        $ing = Ingredient::create(['name' => 'Drink', 'code' => 'ING-DRK', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id]);

        $today = now()->format('Y-m-d');

        // Order at target location ($this->locTo)
        $lTarget = InventoryLedger::create([
            'business_location_id' => $this->locTo->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'sale',
            'quantity' => -1,
            'running_balance' => 99,
            'reference_type' => 'App\Models\Order',
            'reference_id' => 'ORD-LOC-TARGET',
            'created_by' => $this->admin->id,
        ]);
        $lTarget->created_at = $today . ' 15:00:00';
        $lTarget->save();

        // Order at other location ($this->locFrom)
        $lOther = InventoryLedger::create([
            'business_location_id' => $this->locFrom->id,
            'storage_location_id' => $this->storageMain->id,
            'ingredient_id' => $ing->id,
            'transaction_type' => 'sale',
            'quantity' => -1,
            'running_balance' => 99,
            'reference_type' => 'App\Models\Order',
            'reference_id' => 'ORD-LOC-OTHER',
            'created_by' => $this->admin->id,
        ]);
        $lOther->created_at = $today . ' 15:00:00';
        $lOther->save();

        $res = $this->actingAs($this->admin)->get(route('consumption.index'));
        $res->assertStatus(200);
        $res->assertInertia(fn ($page) => 
            $page->component('inventory/consumption/index')
                ->where('globalTotalOrders', 1)
        );
    }

    /** @test */
    public function test_daily_consumption_global_total_orders_cost_calculation_regression_safety()
    {
        $cat = IngredientCategory::create(['name' => 'General']);
        $uom = \App\Models\UnitOfMeasure::create(['name' => 'Each', 'code' => 'EA', 'type' => 'Unit', 'status' => 1]);
        $ing = Ingredient::create(['name' => 'Steak', 'code' => 'ING-STK', 'ingredient_category_id' => $cat->id, 'base_uom_id' => $uom->id]);
        $supplier = \App\Models\Supplier::create(['name' => 'Meat Corp', 'status' => 1]);

        \App\Models\IngredientSupplier::create([
            'ingredient_id' => $ing->id,
            'supplier_id' => $supplier->id,
            'purchase_uom_id' => $uom->id,
            'price' => 10.00,
            'is_preferred' => true,
            'status' => true,
        ]);

        $today = now()->format('Y-m-d');
        // 2 orders consuming 5 EA total (3 EA in Order 1, 2 EA in Order 2)
        foreach ([['ORD-STK-1', -3], ['ORD-STK-2', -2]] as [$ordId, $qty]) {
            $l = InventoryLedger::create([
                'business_location_id' => $this->locTo->id,
                'storage_location_id' => $this->storageMain->id,
                'ingredient_id' => $ing->id,
                'transaction_type' => 'sale',
                'quantity' => $qty,
                'running_balance' => 90,
                'reference_type' => 'App\Models\Order',
                'reference_id' => $ordId,
                'created_by' => $this->admin->id,
            ]);
            $l->created_at = $today . ' 16:00:00';
            $l->save();
        }

        $res = $this->actingAs($this->admin)->get(route('consumption.index'));
        $res->assertStatus(200);
        $res->assertInertia(fn ($page) => 
            $page->component('inventory/consumption/index')
                ->where('globalTotalOrders', 2)
                ->where('consumptions.0.total_consumed', 5)
                ->where('consumptions.0.total_cost', 50)
        );
    }

    /** @test */
    public function test_daily_consumption_index_renders_cleanly_with_inertia_props()
    {
        $res = $this->actingAs($this->admin)->get(route('consumption.index'));
        $res->assertStatus(200);
        $res->assertInertia(fn ($page) => 
            $page->component('inventory/consumption/index')
                ->has('consumptions')
                ->has('globalTotalOrders')
                ->has('serverCategories')
                ->has('filters')
        );
    }
}


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
}

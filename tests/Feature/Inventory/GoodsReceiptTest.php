<?php

namespace Tests\Feature\Inventory;

use App\Models\BusinessLocation;
use App\Models\GoodsReceiptNote;
use App\Models\PurchaseOrder;
use App\Models\Role;
use App\Models\StockTransferOrder;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GoodsReceiptTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $staffLocationA;
    protected BusinessLocation $locationA;
    protected BusinessLocation $locationB;

    protected function setUp(): void
    {
        parent::setUp();

        $roleAdmin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $roleStaff = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);

        $this->locationA = BusinessLocation::factory()->create(['location_name' => 'Location Alpha']);
        $this->locationB = BusinessLocation::factory()->create(['location_name' => 'Location Beta']);

        $this->admin = User::factory()->create([
            'business_location_id' => $this->locationA->id,
        ]);
        $this->admin->assignRole($roleAdmin);

        $this->staffLocationA = User::factory()->create([
            'business_location_id' => $this->locationA->id,
        ]);
        $this->staffLocationA->assignRole($roleStaff);
    }

    /** @test */
    public function test_completed_kpi_card_counts_completed_grns_correctly()
    {
        GoodsReceiptNote::create([
            'grn_number' => 'GRN-101',
            'location_id' => $this->locationA->id,
            'received_by_id' => $this->admin->id,
            'status' => 'completed',
        ]);

        GoodsReceiptNote::create([
            'grn_number' => 'GRN-102',
            'location_id' => $this->locationA->id,
            'received_by_id' => $this->admin->id,
            'status' => 'completed',
        ]);

        GoodsReceiptNote::create([
            'grn_number' => 'GRN-103',
            'location_id' => $this->locationA->id,
            'received_by_id' => $this->admin->id,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->admin)->get(route('grns.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('stats.completed', 2)
                ->where('stats.draft', 1)
                ->where('stats.total', 3)
        );
    }

    /** @test */
    public function test_kpi_totals_represent_all_matching_grns_across_pagination()
    {
        for ($i = 1; $i <= 15; $i++) {
            GoodsReceiptNote::create([
                'grn_number' => "GRN-PAG-$i",
                'location_id' => $this->locationA->id,
                'received_by_id' => $this->admin->id,
                'status' => 'completed',
            ]);
        }

        $response = $this->actingAs($this->admin)->get(route('grns.index', ['perPage' => 10]));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('stats.total', 15)
                ->where('stats.completed', 15)
                ->where('grns.meta.total', 15)
                ->where('grns.meta.perPage', 10)
                ->has('grns.rows', 10)
        );
    }

    /** @test */
    public function test_draft_pending_kpi_counts_draft_records()
    {
        GoodsReceiptNote::create([
            'grn_number' => 'GRN-DFT-1',
            'location_id' => $this->locationA->id,
            'received_by_id' => $this->admin->id,
            'status' => 'draft',
        ]);

        GoodsReceiptNote::create([
            'grn_number' => 'GRN-DFT-2',
            'location_id' => $this->locationA->id,
            'received_by_id' => $this->admin->id,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->admin)->get(route('grns.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('stats.draft', 2)
        );
    }

    /** @test */
    public function test_sto_vs_po_kpi_counts_do_not_overlap()
    {
        $supplier = Supplier::create(['name' => 'Supplier One', 'status' => 1]);
        $po1 = PurchaseOrder::create(['po_number' => 'PO-100', 'supplier_id' => $supplier->id, 'business_location_id' => $this->locationA->id, 'delivery_location_id' => $this->locationA->id, 'status' => 'approved', 'grand_total' => 100, 'created_by' => $this->admin->id]);
        $po2 = PurchaseOrder::create(['po_number' => 'PO-101', 'supplier_id' => $supplier->id, 'business_location_id' => $this->locationA->id, 'delivery_location_id' => $this->locationA->id, 'status' => 'approved', 'grand_total' => 200, 'created_by' => $this->admin->id]);

        $ir = \App\Models\InternalRequest::create(['request_number' => 'IR-100', 'from_location_id' => $this->locationB->id, 'to_location_id' => $this->locationA->id, 'requested_by_id' => $this->admin->id, 'status' => 'approved']);
        $sto = StockTransferOrder::create(['sto_number' => 'STO-100', 'internal_request_id' => $ir->id, 'from_location_id' => $this->locationB->id, 'to_location_id' => $this->locationA->id, 'status' => 'dispatched', 'created_by' => $this->admin->id]);

        GoodsReceiptNote::create(['grn_number' => 'GRN-PO-1', 'purchase_order_id' => $po1->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);
        GoodsReceiptNote::create(['grn_number' => 'GRN-PO-2', 'purchase_order_id' => $po2->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);
        GoodsReceiptNote::create(['grn_number' => 'GRN-STO-1', 'stock_transfer_order_id' => $sto->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->admin)->get(route('grns.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('stats.external', 2)
                ->where('stats.internal', 1)
                ->where('stats.total', 3)
        );
    }

    /** @test */
    public function test_location_isolation_for_non_admin_and_admin()
    {
        GoodsReceiptNote::create(['grn_number' => 'GRN-LOCA-1', 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);
        GoodsReceiptNote::create(['grn_number' => 'GRN-LOCB-1', 'location_id' => $this->locationB->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);
        GoodsReceiptNote::create(['grn_number' => 'GRN-LOCB-2', 'location_id' => $this->locationB->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $resStaff = $this->actingAs($this->staffLocationA)->get(route('grns.index'));
        $resStaff->assertStatus(200);
        $resStaff->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('stats.total', 1)
                ->where('grns.meta.total', 1)
        );

        $resAdmin = $this->actingAs($this->admin)->get(route('grns.index'));
        $resAdmin->assertStatus(200);
        $resAdmin->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('stats.total', 3)
                ->where('grns.meta.total', 3)
        );
    }

    /** @test */
    public function test_search_by_grn_number()
    {
        GoodsReceiptNote::create(['grn_number' => 'GRN-TARGET-99', 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);
        GoodsReceiptNote::create(['grn_number' => 'GRN-OTHER-11', 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->admin)->get(route('grns.index', ['search' => 'TARGET-99']));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.meta.total', 1)
                ->where('grns.rows.0.grn_number', 'GRN-TARGET-99')
        );
    }

    /** @test */
    public function test_search_by_receiving_location()
    {
        GoodsReceiptNote::create(['grn_number' => 'GRN-LOC-A1', 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);
        GoodsReceiptNote::create(['grn_number' => 'GRN-LOC-B1', 'location_id' => $this->locationB->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->admin)->get(route('grns.index', ['search' => 'Location Alpha']));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.meta.total', 1)
                ->where('grns.rows.0.grn_number', 'GRN-LOC-A1')
        );
    }

    /** @test */
    public function test_search_by_supplier_vendor()
    {
        $supplier = Supplier::create(['name' => 'Prime Fresh Meat Co', 'status' => 1]);
        $po = PurchaseOrder::create(['po_number' => 'PO-MEAT-1', 'supplier_id' => $supplier->id, 'business_location_id' => $this->locationA->id, 'delivery_location_id' => $this->locationA->id, 'status' => 'approved', 'grand_total' => 500, 'created_by' => $this->admin->id]);

        GoodsReceiptNote::create(['grn_number' => 'GRN-MEAT-1', 'purchase_order_id' => $po->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);
        GoodsReceiptNote::create(['grn_number' => 'GRN-OTHER-2', 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->admin)->get(route('grns.index', ['search' => 'Prime Fresh Meat']));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.meta.total', 1)
                ->where('grns.rows.0.grn_number', 'GRN-MEAT-1')
        );
    }

    /** @test */
    public function test_search_by_po_number()
    {
        $supplier = Supplier::create(['name' => 'Vendor Standard', 'status' => 1]);
        $po = PurchaseOrder::create(['po_number' => 'PO-SPECIAL-999', 'supplier_id' => $supplier->id, 'business_location_id' => $this->locationA->id, 'delivery_location_id' => $this->locationA->id, 'status' => 'approved', 'grand_total' => 300, 'created_by' => $this->admin->id]);

        GoodsReceiptNote::create(['grn_number' => 'GRN-PO-FOUND', 'purchase_order_id' => $po->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->admin)->get(route('grns.index', ['search' => 'PO-SPECIAL-999']));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.meta.total', 1)
                ->where('grns.rows.0.grn_number', 'GRN-PO-FOUND')
        );
    }

    /** @test */
    public function test_search_by_sto_number()
    {
        $ir = \App\Models\InternalRequest::create(['request_number' => 'IR-777', 'from_location_id' => $this->locationB->id, 'to_location_id' => $this->locationA->id, 'requested_by_id' => $this->admin->id, 'status' => 'approved']);
        $sto = StockTransferOrder::create(['sto_number' => 'STO-TRANSFER-777', 'internal_request_id' => $ir->id, 'from_location_id' => $this->locationB->id, 'to_location_id' => $this->locationA->id, 'status' => 'dispatched', 'created_by' => $this->admin->id]);

        GoodsReceiptNote::create(['grn_number' => 'GRN-STO-FOUND', 'stock_transfer_order_id' => $sto->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->admin)->get(route('grns.index', ['search' => 'STO-TRANSFER-777']));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.meta.total', 1)
                ->where('grns.rows.0.grn_number', 'GRN-STO-FOUND')
        );
    }

    /** @test */
    public function test_search_with_pagination()
    {
        for ($i = 1; $i <= 12; $i++) {
            GoodsReceiptNote::create([
                'grn_number' => "GRN-MATCH-$i",
                'location_id' => $this->locationA->id,
                'received_by_id' => $this->admin->id,
                'status' => 'completed',
            ]);
        }

        $response = $this->actingAs($this->admin)->get(route('grns.index', ['search' => 'MATCH', 'perPage' => 10]));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.meta.total', 12)
                ->where('grns.meta.perPage', 10)
                ->has('grns.rows', 10)
        );
    }

    /** @test */
    public function test_search_respects_location_isolation()
    {
        GoodsReceiptNote::create(['grn_number' => 'GRN-SHARED-A', 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);
        GoodsReceiptNote::create(['grn_number' => 'GRN-SHARED-B', 'location_id' => $this->locationB->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->staffLocationA)->get(route('grns.index', ['search' => 'GRN-SHARED']));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.meta.total', 1)
                ->where('grns.rows.0.grn_number', 'GRN-SHARED-A')
        );
    }

    /** @test */
    public function test_all_receipts_returns_both_po_and_sto_grns()
    {
        $supplier = Supplier::create(['name' => 'Supplier Alpha', 'status' => 1]);
        $po = PurchaseOrder::create(['po_number' => 'PO-ALL-1', 'supplier_id' => $supplier->id, 'business_location_id' => $this->locationA->id, 'delivery_location_id' => $this->locationA->id, 'status' => 'approved', 'grand_total' => 100, 'created_by' => $this->admin->id]);
        $ir = \App\Models\InternalRequest::create(['request_number' => 'IR-ALL-1', 'from_location_id' => $this->locationB->id, 'to_location_id' => $this->locationA->id, 'requested_by_id' => $this->admin->id, 'status' => 'approved']);
        $sto = StockTransferOrder::create(['sto_number' => 'STO-ALL-1', 'internal_request_id' => $ir->id, 'from_location_id' => $this->locationB->id, 'to_location_id' => $this->locationA->id, 'status' => 'dispatched', 'created_by' => $this->admin->id]);

        GoodsReceiptNote::create(['grn_number' => 'GRN-PO-REC', 'purchase_order_id' => $po->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);
        GoodsReceiptNote::create(['grn_number' => 'GRN-STO-REC', 'stock_transfer_order_id' => $sto->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->admin)->get(route('grns.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.meta.total', 2)
        );
    }

    /** @test */
    public function test_internal_tab_returns_only_sto_grns()
    {
        $supplier = Supplier::create(['name' => 'Supplier Beta', 'status' => 1]);
        $po = PurchaseOrder::create(['po_number' => 'PO-INT-1', 'supplier_id' => $supplier->id, 'business_location_id' => $this->locationA->id, 'delivery_location_id' => $this->locationA->id, 'status' => 'approved', 'grand_total' => 100, 'created_by' => $this->admin->id]);
        $ir = \App\Models\InternalRequest::create(['request_number' => 'IR-INT-1', 'from_location_id' => $this->locationB->id, 'to_location_id' => $this->locationA->id, 'requested_by_id' => $this->admin->id, 'status' => 'approved']);
        $sto = StockTransferOrder::create(['sto_number' => 'STO-INT-1', 'internal_request_id' => $ir->id, 'from_location_id' => $this->locationB->id, 'to_location_id' => $this->locationA->id, 'status' => 'dispatched', 'created_by' => $this->admin->id]);

        GoodsReceiptNote::create(['grn_number' => 'GRN-PO-EXCLUDED', 'purchase_order_id' => $po->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);
        GoodsReceiptNote::create(['grn_number' => 'GRN-STO-INCLUDED', 'stock_transfer_order_id' => $sto->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->admin)->get(route('grns.index', ['source_type' => 'internal']));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.meta.total', 1)
                ->where('grns.rows.0.grn_number', 'GRN-STO-INCLUDED')
        );
    }

    /** @test */
    public function test_external_tab_returns_only_po_grns()
    {
        $supplier = Supplier::create(['name' => 'Supplier Gamma', 'status' => 1]);
        $po = PurchaseOrder::create(['po_number' => 'PO-EXT-1', 'supplier_id' => $supplier->id, 'business_location_id' => $this->locationA->id, 'delivery_location_id' => $this->locationA->id, 'status' => 'approved', 'grand_total' => 100, 'created_by' => $this->admin->id]);
        $ir = \App\Models\InternalRequest::create(['request_number' => 'IR-EXT-1', 'from_location_id' => $this->locationB->id, 'to_location_id' => $this->locationA->id, 'requested_by_id' => $this->admin->id, 'status' => 'approved']);
        $sto = StockTransferOrder::create(['sto_number' => 'STO-EXT-1', 'internal_request_id' => $ir->id, 'from_location_id' => $this->locationB->id, 'to_location_id' => $this->locationA->id, 'status' => 'dispatched', 'created_by' => $this->admin->id]);

        GoodsReceiptNote::create(['grn_number' => 'GRN-PO-INCLUDED', 'purchase_order_id' => $po->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);
        GoodsReceiptNote::create(['grn_number' => 'GRN-STO-EXCLUDED', 'stock_transfer_order_id' => $sto->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->admin)->get(route('grns.index', ['source_type' => 'external']));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.meta.total', 1)
                ->where('grns.rows.0.grn_number', 'GRN-PO-INCLUDED')
        );
    }

    /** @test */
    public function test_source_type_filtering_works_with_pagination()
    {
        $supplier = Supplier::create(['name' => 'Supplier Delta', 'status' => 1]);
        $po = PurchaseOrder::create(['po_number' => 'PO-PAG-1', 'supplier_id' => $supplier->id, 'business_location_id' => $this->locationA->id, 'delivery_location_id' => $this->locationA->id, 'status' => 'approved', 'grand_total' => 100, 'created_by' => $this->admin->id]);

        for ($i = 1; $i <= 12; $i++) {
            GoodsReceiptNote::create([
                'grn_number' => "GRN-PO-PAG-$i",
                'purchase_order_id' => $po->id,
                'location_id' => $this->locationA->id,
                'received_by_id' => $this->admin->id,
                'status' => 'completed',
            ]);
        }

        $response = $this->actingAs($this->admin)->get(route('grns.index', ['source_type' => 'external', 'perPage' => 10]));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.meta.total', 12)
                ->where('grns.meta.perPage', 10)
                ->has('grns.rows', 10)
        );
    }

    /** @test */
    public function test_source_type_filtering_works_with_search()
    {
        $supplier = Supplier::create(['name' => 'Supplier Epsilon', 'status' => 1]);
        $po1 = PurchaseOrder::create(['po_number' => 'PO-SRCH-1', 'supplier_id' => $supplier->id, 'business_location_id' => $this->locationA->id, 'delivery_location_id' => $this->locationA->id, 'status' => 'approved', 'grand_total' => 100, 'created_by' => $this->admin->id]);
        $po2 = PurchaseOrder::create(['po_number' => 'PO-SRCH-2', 'supplier_id' => $supplier->id, 'business_location_id' => $this->locationA->id, 'delivery_location_id' => $this->locationA->id, 'status' => 'approved', 'grand_total' => 100, 'created_by' => $this->admin->id]);

        GoodsReceiptNote::create(['grn_number' => 'GRN-PO-MATCHME', 'purchase_order_id' => $po1->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);
        GoodsReceiptNote::create(['grn_number' => 'GRN-PO-BETA', 'purchase_order_id' => $po2->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->admin)->get(route('grns.index', ['source_type' => 'external', 'search' => 'MATCHME']));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.meta.total', 1)
                ->where('grns.rows.0.grn_number', 'GRN-PO-MATCHME')
        );
    }

    /** @test */
    public function test_switching_source_type_does_not_bypass_location_isolation()
    {
        $supplier = Supplier::create(['name' => 'Supplier Zeta', 'status' => 1]);
        $poB = PurchaseOrder::create(['po_number' => 'PO-LOCB-1', 'supplier_id' => $supplier->id, 'business_location_id' => $this->locationB->id, 'delivery_location_id' => $this->locationB->id, 'status' => 'approved', 'grand_total' => 100, 'created_by' => $this->admin->id]);

        GoodsReceiptNote::create(['grn_number' => 'GRN-PO-LOCB', 'purchase_order_id' => $poB->id, 'location_id' => $this->locationB->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->staffLocationA)->get(route('grns.index', ['source_type' => 'external']));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.meta.total', 0)
                ->has('grns.rows', 0)
        );
    }

    /** @test */
    public function test_external_grn_resolves_supplier_and_po_number()
    {
        $supplier = Supplier::create(['name' => 'Atlantic Seafood Corp', 'status' => 1]);
        $po = PurchaseOrder::create(['po_number' => 'PO-FISH-100', 'supplier_id' => $supplier->id, 'business_location_id' => $this->locationA->id, 'delivery_location_id' => $this->locationA->id, 'status' => 'approved', 'grand_total' => 450, 'created_by' => $this->admin->id]);

        GoodsReceiptNote::create(['grn_number' => 'GRN-FISH-100', 'purchase_order_id' => $po->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->admin)->get(route('grns.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.rows.0.purchase_order.supplier.name', 'Atlantic Seafood Corp')
                ->where('grns.rows.0.purchase_order.po_number', 'PO-FISH-100')
                ->where('grns.rows.0.location.location_name', 'Location Alpha')
        );
    }

    /** @test */
    public function test_internal_grn_resolves_sending_location_and_sto_number()
    {
        $sendingLocation = BusinessLocation::factory()->create(['location_name' => 'Central Depot Branch']);
        $ir = \App\Models\InternalRequest::create(['request_number' => 'IR-DEPOT-1', 'from_location_id' => $sendingLocation->id, 'to_location_id' => $this->locationA->id, 'requested_by_id' => $this->admin->id, 'status' => 'approved']);
        $sto = StockTransferOrder::create(['sto_number' => 'STO-DEPOT-99', 'internal_request_id' => $ir->id, 'from_location_id' => $sendingLocation->id, 'to_location_id' => $this->locationA->id, 'status' => 'dispatched', 'created_by' => $this->admin->id]);

        GoodsReceiptNote::create(['grn_number' => 'GRN-DEPOT-99', 'stock_transfer_order_id' => $sto->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->admin)->get(route('grns.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.rows.0.stock_transfer_order.from_location.location_name', 'Central Depot Branch')
                ->where('grns.rows.0.stock_transfer_order.sto_number', 'STO-DEPOT-99')
                ->where('grns.rows.0.location.location_name', 'Location Alpha')
        );
    }

    /** @test */
    public function test_search_by_sending_location_name()
    {
        $depot = BusinessLocation::factory()->create(['location_name' => 'Highland Warehouse Depot']);
        $ir = \App\Models\InternalRequest::create(['request_number' => 'IR-HIGH-1', 'from_location_id' => $depot->id, 'to_location_id' => $this->locationA->id, 'requested_by_id' => $this->admin->id, 'status' => 'approved']);
        $sto = StockTransferOrder::create(['sto_number' => 'STO-HIGH-1', 'internal_request_id' => $ir->id, 'from_location_id' => $depot->id, 'to_location_id' => $this->locationA->id, 'status' => 'dispatched', 'created_by' => $this->admin->id]);

        GoodsReceiptNote::create(['grn_number' => 'GRN-HIGH-1', 'stock_transfer_order_id' => $sto->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->admin)->get(route('grns.index', ['search' => 'Highland Warehouse']));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.meta.total', 1)
                ->where('grns.rows.0.grn_number', 'GRN-HIGH-1')
        );
    }

    /** @test */
    public function test_source_location_is_distinct_from_receiving_location()
    {
        $sender = BusinessLocation::factory()->create(['location_name' => 'Origin Outlet West']);
        $receiver = $this->locationA; // Location Alpha

        $ir = \App\Models\InternalRequest::create(['request_number' => 'IR-DIST-1', 'from_location_id' => $sender->id, 'to_location_id' => $receiver->id, 'requested_by_id' => $this->admin->id, 'status' => 'approved']);
        $sto = StockTransferOrder::create(['sto_number' => 'STO-DIST-1', 'internal_request_id' => $ir->id, 'from_location_id' => $sender->id, 'to_location_id' => $receiver->id, 'status' => 'dispatched', 'created_by' => $this->admin->id]);

        GoodsReceiptNote::create(['grn_number' => 'GRN-DIST-1', 'stock_transfer_order_id' => $sto->id, 'location_id' => $receiver->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->admin)->get(route('grns.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.rows.0.stock_transfer_order.from_location.location_name', 'Origin Outlet West')
                ->where('grns.rows.0.location.location_name', 'Location Alpha')
        );
    }

    /** @test */
    public function test_po_over_receiving_is_rejected()
    {
        $supplier = Supplier::create(['name' => 'Over-Receive Supplier', 'status' => 1]);
        $category = \App\Models\IngredientCategory::create(['name' => 'Category OVER', 'status' => true]);
        $uom = \App\Models\UnitOfMeasure::create(['name' => 'KG OVER', 'code' => 'kgo', 'type' => 'weight', 'conversion_factor' => 1, 'status' => 1]);
        $ingredient = \App\Models\Ingredient::create(['name' => 'Beef Patty', 'code' => 'ING-OVR-1', 'ingredient_category_id' => $category->id, 'base_uom_id' => $uom->id, 'status' => 1]);

        $po = PurchaseOrder::create(['po_number' => 'PO-OVER-1', 'supplier_id' => $supplier->id, 'business_location_id' => $this->locationA->id, 'delivery_location_id' => $this->locationA->id, 'status' => 'approved', 'grand_total' => 100, 'created_by' => $this->admin->id]);
        $poItem = \App\Models\PurchaseOrderItem::create([
            'purchase_order_id' => $po->id,
            'ingredient_id' => $ingredient->id,
            'quantity' => 10,
            'unit_price' => 10,
            'purchase_uom_id' => $uom->id,
            'received_quantity' => 0,
            'rejected_quantity' => 0,
        ]);

        $response = $this->actingAs($this->admin)->post(route('grns.store'), [
            'po_id' => $po->id,
            'items' => [
                [
                    'ingredient_id' => $ingredient->id,
                    'expected_quantity' => 10,
                    'received_quantity' => 15,
                    'rejected_quantity' => 0,
                    'uom_id' => $uom->id,
                ]
            ]
        ]);

        $response->assertStatus(422);
        $this->assertEquals(0, GoodsReceiptNote::count());
        $this->assertEquals(0, $poItem->fresh()->received_quantity);
        $this->assertEquals(0, \App\Models\InventoryLedger::count());
    }

    /** @test */
    public function test_po_remaining_quantity_after_partial_receipt()
    {
        $supplier = Supplier::create(['name' => 'Partial Supplier', 'status' => 1]);
        $category = \App\Models\IngredientCategory::create(['name' => 'Category PART', 'status' => true]);
        $uom = \App\Models\UnitOfMeasure::create(['name' => 'KG PART', 'code' => 'kgp', 'type' => 'weight', 'conversion_factor' => 1, 'status' => 1]);
        $ingredient = \App\Models\Ingredient::create(['name' => 'Chicken Breast', 'code' => 'ING-PRT-1', 'ingredient_category_id' => $category->id, 'base_uom_id' => $uom->id, 'status' => 1]);

        $po = PurchaseOrder::create(['po_number' => 'PO-PARTIAL-1', 'supplier_id' => $supplier->id, 'business_location_id' => $this->locationA->id, 'delivery_location_id' => $this->locationA->id, 'status' => 'approved', 'grand_total' => 100, 'created_by' => $this->admin->id]);
        $poItem = \App\Models\PurchaseOrderItem::create([
            'purchase_order_id' => $po->id,
            'ingredient_id' => $ingredient->id,
            'quantity' => 10,
            'unit_price' => 10,
            'purchase_uom_id' => $uom->id,
            'received_quantity' => 0,
            'rejected_quantity' => 0,
        ]);

        $res1 = $this->actingAs($this->admin)->post(route('grns.store'), [
            'po_id' => $po->id,
            'items' => [
                [
                    'ingredient_id' => $ingredient->id,
                    'expected_quantity' => 10,
                    'received_quantity' => 6,
                    'rejected_quantity' => 0,
                    'uom_id' => $uom->id,
                ]
            ]
        ]);
        $res1->assertRedirect(route('grns.index'));
        $this->assertEquals('partially_received', $po->fresh()->status);
        $this->assertEquals(6, $poItem->fresh()->received_quantity);

        $res2 = $this->actingAs($this->admin)->post(route('grns.store'), [
            'po_id' => $po->id,
            'items' => [
                [
                    'ingredient_id' => $ingredient->id,
                    'expected_quantity' => 4,
                    'received_quantity' => 5,
                    'rejected_quantity' => 0,
                    'uom_id' => $uom->id,
                ]
            ]
        ]);
        $res2->assertStatus(422);

        $this->assertEquals(1, GoodsReceiptNote::count());
        $this->assertEquals(6, $poItem->fresh()->received_quantity);
    }

    /** @test */
    public function test_sto_over_receiving_is_rejected()
    {
        $category = \App\Models\IngredientCategory::create(['name' => 'Category STO OVR', 'status' => true]);
        $uom = \App\Models\UnitOfMeasure::create(['name' => 'KG STO OVR', 'code' => 'kgso', 'type' => 'weight', 'conversion_factor' => 1, 'status' => 1]);
        $ingredient = \App\Models\Ingredient::create(['name' => 'Cheddar Cheese', 'code' => 'ING-STO-1', 'ingredient_category_id' => $category->id, 'base_uom_id' => $uom->id, 'status' => 1]);

        $ir = \App\Models\InternalRequest::create(['request_number' => 'IR-STO-OVER', 'from_location_id' => $this->locationB->id, 'to_location_id' => $this->locationA->id, 'requested_by_id' => $this->admin->id, 'status' => 'approved']);
        $sto = StockTransferOrder::create(['sto_number' => 'STO-OVER-1', 'internal_request_id' => $ir->id, 'from_location_id' => $this->locationB->id, 'to_location_id' => $this->locationA->id, 'status' => 'dispatched', 'created_by' => $this->admin->id]);
        $stoItem = \App\Models\StockTransferOrderItem::create([
            'stock_transfer_order_id' => $sto->id,
            'ingredient_id' => $ingredient->id,
            'approved_quantity' => 10,
            'dispatched_quantity' => 10,
            'received_quantity' => 0,
            'rejected_quantity' => 0,
            'uom_id' => $uom->id,
        ]);

        $response = $this->actingAs($this->admin)->post(route('grns.store'), [
            'sto_id' => $sto->id,
            'items' => [
                [
                    'ingredient_id' => $ingredient->id,
                    'expected_quantity' => 10,
                    'received_quantity' => 12,
                    'rejected_quantity' => 0,
                    'uom_id' => $uom->id,
                ]
            ]
        ]);

        $response->assertStatus(422);
        $this->assertEquals(0, GoodsReceiptNote::count());
        $this->assertEquals(0, $stoItem->fresh()->received_quantity);
        $this->assertEquals(0, \App\Models\InventoryLedger::count());
    }

    /** @test */
    public function test_sto_partial_receiving_sequence()
    {
        $category = \App\Models\IngredientCategory::create(['name' => 'Category STO PRT', 'status' => true]);
        $uom = \App\Models\UnitOfMeasure::create(['name' => 'KG STO PRT', 'code' => 'kgsp', 'type' => 'weight', 'conversion_factor' => 1, 'status' => 1]);
        $ingredient = \App\Models\Ingredient::create(['name' => 'Tomato Sauce', 'code' => 'ING-STO-2', 'ingredient_category_id' => $category->id, 'base_uom_id' => $uom->id, 'status' => 1]);

        $ir = \App\Models\InternalRequest::create(['request_number' => 'IR-STO-PART', 'from_location_id' => $this->locationB->id, 'to_location_id' => $this->locationA->id, 'requested_by_id' => $this->admin->id, 'status' => 'approved']);
        $sto = StockTransferOrder::create(['sto_number' => 'STO-PART-1', 'internal_request_id' => $ir->id, 'from_location_id' => $this->locationB->id, 'to_location_id' => $this->locationA->id, 'status' => 'dispatched', 'created_by' => $this->admin->id]);
        $stoItem = \App\Models\StockTransferOrderItem::create([
            'stock_transfer_order_id' => $sto->id,
            'ingredient_id' => $ingredient->id,
            'approved_quantity' => 10,
            'dispatched_quantity' => 10,
            'received_quantity' => 0,
            'rejected_quantity' => 0,
            'uom_id' => $uom->id,
        ]);

        $res1 = $this->actingAs($this->admin)->post(route('grns.store'), [
            'sto_id' => $sto->id,
            'items' => [
                [
                    'ingredient_id' => $ingredient->id,
                    'expected_quantity' => 10,
                    'received_quantity' => 6,
                    'rejected_quantity' => 0,
                    'uom_id' => $uom->id,
                ]
            ]
        ]);
        $res1->assertRedirect(route('grns.index'));
        $this->assertEquals('partially_received', $sto->fresh()->status);

        $res2 = $this->actingAs($this->admin)->post(route('grns.store'), [
            'sto_id' => $sto->id,
            'items' => [
                [
                    'ingredient_id' => $ingredient->id,
                    'expected_quantity' => 4,
                    'received_quantity' => 4,
                    'rejected_quantity' => 0,
                    'uom_id' => $uom->id,
                ]
            ]
        ]);
        $res2->assertRedirect(route('grns.index'));
        $this->assertEquals('received', $sto->fresh()->status);
        $this->assertEquals(10, $stoItem->fresh()->received_quantity);
    }

    /** @test */
    public function test_100_percent_rejected_sto_behavior()
    {
        $category = \App\Models\IngredientCategory::create(['name' => 'Category REJ', 'status' => true]);
        $uom = \App\Models\UnitOfMeasure::create(['name' => 'KG REJ', 'code' => 'kgr', 'type' => 'weight', 'conversion_factor' => 1, 'status' => 1]);
        $ingredient = \App\Models\Ingredient::create(['name' => 'Spoiled Milk', 'code' => 'ING-STO-3', 'ingredient_category_id' => $category->id, 'base_uom_id' => $uom->id, 'status' => 1]);

        $ir = \App\Models\InternalRequest::create(['request_number' => 'IR-STO-REJ', 'from_location_id' => $this->locationB->id, 'to_location_id' => $this->locationA->id, 'requested_by_id' => $this->admin->id, 'status' => 'approved']);
        $sto = StockTransferOrder::create(['sto_number' => 'STO-REJ-1', 'internal_request_id' => $ir->id, 'from_location_id' => $this->locationB->id, 'to_location_id' => $this->locationA->id, 'status' => 'dispatched', 'created_by' => $this->admin->id]);
        $stoItem = \App\Models\StockTransferOrderItem::create([
            'stock_transfer_order_id' => $sto->id,
            'ingredient_id' => $ingredient->id,
            'approved_quantity' => 10,
            'dispatched_quantity' => 10,
            'received_quantity' => 0,
            'rejected_quantity' => 0,
            'uom_id' => $uom->id,
        ]);

        $response = $this->actingAs($this->admin)->post(route('grns.store'), [
            'sto_id' => $sto->id,
            'items' => [
                [
                    'ingredient_id' => $ingredient->id,
                    'expected_quantity' => 10,
                    'received_quantity' => 0,
                    'rejected_quantity' => 10,
                    'uom_id' => $uom->id,
                ]
            ]
        ]);

        $response->assertRedirect(route('grns.index'));
        $this->assertEquals('cancelled', $sto->fresh()->status);
        $this->assertEquals(10, $stoItem->fresh()->rejected_quantity);
        $this->assertEquals(0, \App\Models\InventoryLedger::count());
    }

    /** @test */
    public function test_malicious_expected_quantity_manipulation()
    {
        $supplier = Supplier::create(['name' => 'Hacker Supplier', 'status' => 1]);
        $category = \App\Models\IngredientCategory::create(['name' => 'Category HACK', 'status' => true]);
        $uom = \App\Models\UnitOfMeasure::create(['name' => 'KG HACK', 'code' => 'kgh', 'type' => 'weight', 'conversion_factor' => 1, 'status' => 1]);
        $ingredient = \App\Models\Ingredient::create(['name' => 'Gold Bars', 'code' => 'ING-HCK-1', 'ingredient_category_id' => $category->id, 'base_uom_id' => $uom->id, 'status' => 1]);

        $po = PurchaseOrder::create(['po_number' => 'PO-HACK-1', 'supplier_id' => $supplier->id, 'business_location_id' => $this->locationA->id, 'delivery_location_id' => $this->locationA->id, 'status' => 'approved', 'grand_total' => 100, 'created_by' => $this->admin->id]);
        $poItem = \App\Models\PurchaseOrderItem::create([
            'purchase_order_id' => $po->id,
            'ingredient_id' => $ingredient->id,
            'quantity' => 5,
            'unit_price' => 10,
            'purchase_uom_id' => $uom->id,
            'received_quantity' => 0,
            'rejected_quantity' => 0,
        ]);

        $response = $this->actingAs($this->admin)->post(route('grns.store'), [
            'po_id' => $po->id,
            'items' => [
                [
                    'ingredient_id' => $ingredient->id,
                    'expected_quantity' => 999,
                    'received_quantity' => 10,
                    'rejected_quantity' => 0,
                    'uom_id' => $uom->id,
                ]
            ]
        ]);

        $response->assertStatus(422);
        $this->assertEquals(0, GoodsReceiptNote::count());
        $this->assertEquals(0, $poItem->fresh()->received_quantity);
    }

    /** @test */
    public function test_grn_show_page_renders_external_po_source_details()
    {
        $supplier = Supplier::create(['name' => 'Seafood Vendor Corp', 'status' => 1]);
        $po = PurchaseOrder::create(['po_number' => 'PO-FISH-999', 'supplier_id' => $supplier->id, 'business_location_id' => $this->locationA->id, 'delivery_location_id' => $this->locationA->id, 'status' => 'received', 'grand_total' => 100, 'created_by' => $this->admin->id]);
        $grn = GoodsReceiptNote::create(['grn_number' => 'GRN-PO-SHOW-1', 'purchase_order_id' => $po->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->admin)->get(route('grns.show', $grn));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/show')
                ->where('grn.purchase_order.supplier.name', 'Seafood Vendor Corp')
                ->where('grn.purchase_order.po_number', 'PO-FISH-999')
                ->where('grn.location.location_name', 'Location Alpha')
        );
    }

    /** @test */
    public function test_grn_show_page_renders_internal_sto_source_details()
    {
        $sender = BusinessLocation::factory()->create(['location_name' => 'Central Hub Bakery']);
        $ir = \App\Models\InternalRequest::create(['request_number' => 'IR-HUB-1', 'from_location_id' => $sender->id, 'to_location_id' => $this->locationA->id, 'requested_by_id' => $this->admin->id, 'status' => 'approved']);
        $sto = StockTransferOrder::create(['sto_number' => 'STO-HUB-999', 'internal_request_id' => $ir->id, 'from_location_id' => $sender->id, 'to_location_id' => $this->locationA->id, 'status' => 'received', 'created_by' => $this->admin->id]);
        $grn = GoodsReceiptNote::create(['grn_number' => 'GRN-STO-SHOW-1', 'stock_transfer_order_id' => $sto->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->admin)->get(route('grns.show', $grn));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/show')
                ->where('grn.stock_transfer_order.from_location.location_name', 'Central Hub Bakery')
                ->where('grn.stock_transfer_order.sto_number', 'STO-HUB-999')
                ->where('grn.location.location_name', 'Location Alpha')
        );
    }

    /** @test */
    public function test_partial_sto_receipt_displays_partially_received_status()
    {
        $sender = BusinessLocation::factory()->create(['location_name' => 'Depot South']);
        $ir = \App\Models\InternalRequest::create(['request_number' => 'IR-STAT-1', 'from_location_id' => $sender->id, 'to_location_id' => $this->locationA->id, 'requested_by_id' => $this->admin->id, 'status' => 'approved']);
        $sto = StockTransferOrder::create(['sto_number' => 'STO-STAT-1', 'internal_request_id' => $ir->id, 'from_location_id' => $sender->id, 'to_location_id' => $this->locationA->id, 'status' => 'partially_received', 'created_by' => $this->admin->id]);
        GoodsReceiptNote::create(['grn_number' => 'GRN-STAT-1', 'stock_transfer_order_id' => $sto->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->admin)->get(route('grns.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.rows.0.stock_transfer_order.status', 'partially_received')
        );
    }

    /** @test */
    public function test_full_sto_receipt_displays_received_status()
    {
        $sender = BusinessLocation::factory()->create(['location_name' => 'Depot North']);
        $ir = \App\Models\InternalRequest::create(['request_number' => 'IR-STAT-2', 'from_location_id' => $sender->id, 'to_location_id' => $this->locationA->id, 'requested_by_id' => $this->admin->id, 'status' => 'approved']);
        $sto = StockTransferOrder::create(['sto_number' => 'STO-STAT-2', 'internal_request_id' => $ir->id, 'from_location_id' => $sender->id, 'to_location_id' => $this->locationA->id, 'status' => 'received', 'created_by' => $this->admin->id]);
        GoodsReceiptNote::create(['grn_number' => 'GRN-STAT-2', 'stock_transfer_order_id' => $sto->id, 'location_id' => $this->locationA->id, 'received_by_id' => $this->admin->id, 'status' => 'completed']);

        $response = $this->actingAs($this->admin)->get(route('grns.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('purchasing/grns/index')
                ->where('grns.rows.0.stock_transfer_order.status', 'received')
        );
    }
}



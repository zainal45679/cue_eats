<?php

declare(strict_types=1);

namespace Tests\Feature\Inventory;

use App\Models\InventoryBalance;
use App\Models\InventoryLotBalance;
use App\Models\StorageLocation;
use App\Services\InventoryLotService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

final class InventoryLotSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_lot_tracking_schema_is_available(): void
    {
        $this->assertTrue(Schema::hasColumns('inventory_lots', [
            'ingredient_id',
            'source_grn_item_id',
            'internal_lot_number',
            'batch_number',
            'mfg_date',
            'expiry_date',
            'traceability_status',
        ]));

        $this->assertTrue(Schema::hasColumns('inventory_lot_balances', [
            'inventory_lot_id',
            'storage_location_id',
            'available_qty',
            'reserved_qty',
        ]));

        $this->assertTrue(Schema::hasColumns('inventory_lot_movements', [
            'inventory_lot_id',
            'reference_type',
            'reference_id',
            'quantity',
        ]));

        $this->assertTrue(Schema::hasColumns('stock_transfer_lot_allocations', [
            'stock_transfer_order_item_id',
            'inventory_lot_id',
            'dispatched_quantity',
            'received_quantity',
            'rejected_quantity',
        ]));
    }

    public function test_fefo_uses_the_earliest_expiring_lot_first(): void
    {
        $now = now();
        $countryId = (string) Str::uuid();
        $locationId = (string) Str::uuid();
        $storageId = (string) Str::uuid();
        $uomId = (string) Str::uuid();
        $ingredientId = (string) Str::uuid();
        $earlyLotId = (string) Str::uuid();
        $laterLotId = (string) Str::uuid();

        DB::table('countries')->insert(['id' => $countryId, 'uuid' => $countryId, 'name' => 'Test', 'status' => true, 'created_at' => $now, 'updated_at' => $now]);
        DB::table('business_locations')->insert(['id' => $locationId, 'uuid' => $locationId, 'country_id' => $countryId, 'location_name' => 'Test Kitchen', 'location_type' => 'Kitchen', 'created_at' => $now, 'updated_at' => $now]);
        DB::table('storage_locations')->insert(['id' => $storageId, 'uuid' => $storageId, 'business_location_id' => $locationId, 'storage_name' => 'Main Store', 'storage_type' => 'Store', 'status' => true, 'created_at' => $now, 'updated_at' => $now]);
        DB::table('units_of_measure')->insert(['id' => $uomId, 'uuid' => $uomId, 'name' => 'Litre', 'code' => 'L', 'type' => 'volume', 'conversion_factor' => 1, 'status' => true, 'created_at' => $now, 'updated_at' => $now]);
        DB::table('ingredients')->insert(['id' => $ingredientId, 'uuid' => $ingredientId, 'name' => 'Milk', 'base_uom_id' => $uomId, 'is_perishable' => true, 'status' => true, 'created_at' => $now, 'updated_at' => $now]);
        DB::table('inventory_balances')->insert(['id' => (string) Str::uuid(), 'uuid' => (string) Str::uuid(), 'ingredient_id' => $ingredientId, 'storage_location_id' => $storageId, 'available_qty' => 10, 'reserved_qty' => 0, 'on_order_qty' => 0, 'nearest_expiry_date' => today()->addDays(2), 'created_at' => $now, 'updated_at' => $now]);

        foreach ([[$earlyLotId, 'EARLY', 2], [$laterLotId, 'LATER', 8]] as [$lotId, $batch, $days]) {
            DB::table('inventory_lots')->insert(['id' => $lotId, 'ingredient_id' => $ingredientId, 'internal_lot_number' => 'LOT-'.$batch, 'batch_number' => $batch, 'expiry_date' => today()->addDays($days), 'received_at' => $now, 'status' => 'available', 'traceability_status' => 'verified', 'created_at' => $now, 'updated_at' => $now]);
            DB::table('inventory_lot_balances')->insert(['id' => (string) Str::uuid(), 'inventory_lot_id' => $lotId, 'storage_location_id' => $storageId, 'available_qty' => 5, 'reserved_qty' => 0, 'created_at' => $now, 'updated_at' => $now]);
        }

        $allocations = InventoryLotService::deductFefo(
            $ingredientId,
            $storageId,
            6,
            'test_issue',
            StorageLocation::findOrFail($storageId),
            null
        );

        $this->assertSame([$earlyLotId, $laterLotId], $allocations->pluck('lot.id')->all());
        $this->assertSame(0.0, (float) InventoryLotBalance::where('inventory_lot_id', $earlyLotId)->value('available_qty'));
        $this->assertSame(4.0, (float) InventoryLotBalance::where('inventory_lot_id', $laterLotId)->value('available_qty'));
        $this->assertSame(
            today()->addDays(8)->toDateString(),
            InventoryBalance::where('ingredient_id', $ingredientId)
                ->where('storage_location_id', $storageId)
                ->firstOrFail()
                ->nearest_expiry_date
                ->toDateString()
        );
    }
}

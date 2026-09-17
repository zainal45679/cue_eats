<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('inventory_balances')
            ->where('available_qty', '>', 0)
            ->orderBy('id')
            ->each(function (object $balance): void {
                $storage = DB::table('storage_locations')->where('id', $balance->storage_location_id)->first();
                if (! $storage) {
                    return;
                }

                $receipts = DB::table('goods_receipt_note_items as items')
                    ->join('goods_receipt_notes as grns', 'grns.id', '=', 'items.goods_receipt_note_id')
                    ->join('units_of_measure as uoms', 'uoms.id', '=', 'items.uom_id')
                    ->where('items.ingredient_id', $balance->ingredient_id)
                    ->where('grns.location_id', $storage->business_location_id)
                    ->where('items.received_quantity', '>', 0)
                    ->whereNotExists(function ($query): void {
                        $query->selectRaw('1')
                            ->from('inventory_lots')
                            ->whereColumn('inventory_lots.source_grn_item_id', 'items.id');
                    })
                    ->select([
                        'items.id',
                        'items.batch_number',
                        'items.mfg_date',
                        'items.expiry_date',
                        'items.received_quantity',
                        'uoms.conversion_factor',
                        'grns.created_at as received_at',
                    ])
                    ->orderBy('grns.created_at')
                    ->get();

                $receiptTotal = $receipts->sum(fn (object $item): float => (float) $item->received_quantity * ((float) $item->conversion_factor ?: 1)
                );
                $currentTotal = (float) $balance->available_qty;

                // Historical issues and transfers were not lot-aware. Rebuild receipt lots only
                // when the quantities reconcile exactly; otherwise preserve the live total as
                // one explicitly unverified legacy lot instead of inventing batch quantities.
                if ($receipts->isNotEmpty() && abs($receiptTotal - $currentTotal) < 0.001) {
                    foreach ($receipts as $receipt) {
                        $quantity = (float) $receipt->received_quantity * ((float) $receipt->conversion_factor ?: 1);
                        $this->insertLot(
                            $balance,
                            $quantity,
                            $receipt->id,
                            $receipt->batch_number,
                            $receipt->mfg_date,
                            $receipt->expiry_date,
                            $receipt->received_at,
                            $receipt->batch_number ? 'verified' : 'manual'
                        );
                    }

                    return;
                }

                $this->insertLot(
                    $balance,
                    $currentTotal,
                    null,
                    null,
                    null,
                    $balance->nearest_expiry_date ?? null,
                    $balance->created_at,
                    'legacy_unverified'
                );
            });
    }

    public function down(): void
    {
        // The table-creation migration removes all lot data when rolled back.
    }

    private function insertLot(
        object $balance,
        float $quantity,
        ?string $sourceGrnItemId,
        ?string $batchNumber,
        ?string $mfgDate,
        ?string $expiryDate,
        mixed $receivedAt,
        string $traceabilityStatus
    ): void {
        $now = now();
        $lotId = (string) Str::uuid();

        DB::table('inventory_lots')->insert([
            'id' => $lotId,
            'ingredient_id' => $balance->ingredient_id,
            'supplier_id' => null,
            'source_grn_item_id' => $sourceGrnItemId,
            'internal_lot_number' => 'LOT-'.$now->format('ymd').'-'.Str::upper(Str::random(8)),
            'batch_number' => $batchNumber,
            'mfg_date' => $mfgDate,
            'expiry_date' => $expiryDate,
            'received_at' => $receivedAt,
            'status' => 'available',
            'traceability_status' => $traceabilityStatus,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('inventory_lot_balances')->insert([
            'id' => (string) Str::uuid(),
            'inventory_lot_id' => $lotId,
            'storage_location_id' => $balance->storage_location_id,
            'available_qty' => $quantity,
            'reserved_qty' => 0,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }
};

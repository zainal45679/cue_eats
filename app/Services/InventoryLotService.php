<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\GoodsReceiptNoteItem;
use App\Models\Ingredient;
use App\Models\InventoryBalance;
use App\Models\InventoryLot;
use App\Models\InventoryLotBalance;
use App\Models\InventoryLotMovement;
use App\Models\StorageLocation;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class InventoryLotService
{
    public static function receive(
        GoodsReceiptNoteItem $grnItem,
        StorageLocation $storageLocation,
        float $baseQuantity,
        ?string $supplierId,
        ?string $createdBy
    ): InventoryLot {
        $ingredient = Ingredient::findOrFail($grnItem->ingredient_id);

        if ($ingredient->is_perishable && (blank($grnItem->batch_number) || blank($grnItem->expiry_date))) {
            throw ValidationException::withMessages([
                'items' => "Batch number and expiry date are required for {$ingredient->name}.",
            ]);
        }

        if ($grnItem->mfg_date && $grnItem->expiry_date && $grnItem->expiry_date->lt($grnItem->mfg_date)) {
            throw ValidationException::withMessages([
                'items' => "Expiry date must be after the manufacture date for {$ingredient->name}.",
            ]);
        }

        if ($grnItem->expiry_date && $grnItem->expiry_date->lt(today())) {
            throw ValidationException::withMessages([
                'items' => "Expired stock cannot be received for {$ingredient->name}.",
            ]);
        }

        $lot = InventoryLot::firstOrCreate(
            ['source_grn_item_id' => $grnItem->id],
            [
                'ingredient_id' => $grnItem->ingredient_id,
                'supplier_id' => $supplierId,
                'internal_lot_number' => 'LOT-'.now()->format('ymd').'-'.Str::upper(Str::random(6)),
                'batch_number' => $grnItem->batch_number,
                'mfg_date' => $grnItem->mfg_date,
                'expiry_date' => $grnItem->expiry_date,
                'received_at' => now(),
                'status' => 'available',
                'traceability_status' => $grnItem->batch_number ? 'verified' : 'manual',
            ]
        );

        $balance = InventoryLotBalance::firstOrCreate(
            ['inventory_lot_id' => $lot->id, 'storage_location_id' => $storageLocation->id],
            ['available_qty' => 0, 'reserved_qty' => 0]
        );
        $balance->increment('available_qty', $baseQuantity);

        InventoryLotMovement::create([
            'inventory_lot_id' => $lot->id,
            'to_storage_location_id' => $storageLocation->id,
            'movement_type' => 'receipt',
            'quantity' => $baseQuantity,
            'reference_type' => GoodsReceiptNoteItem::class,
            'reference_id' => $grnItem->id,
            'created_by' => $createdBy,
        ]);

        self::refreshNearestExpiry($storageLocation->id, $grnItem->ingredient_id);

        return $lot;
    }

    /**
     * Remove usable stock by FEFO and return the selected lot quantities.
     *
     * @return Collection<int, array{lot: InventoryLot, quantity: float}>
     */
    public static function deductFefo(
        string $ingredientId,
        string $storageLocationId,
        float $quantity,
        string $movementType,
        Model $reference,
        ?string $createdBy
    ): Collection {
        $lotBalances = InventoryLotBalance::query()
            ->with('lot')
            ->where('storage_location_id', $storageLocationId)
            ->where('available_qty', '>', 0)
            ->whereHas('lot', function ($query) use ($ingredientId) {
                $query->where('ingredient_id', $ingredientId)
                    ->where('status', 'available')
                    ->where(function ($dateQuery) {
                        $dateQuery->whereNull('expiry_date')->orWhereDate('expiry_date', '>=', today());
                    });
            })
            ->join('inventory_lots', 'inventory_lots.id', '=', 'inventory_lot_balances.inventory_lot_id')
            ->orderByRaw('CASE WHEN inventory_lots.expiry_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('inventory_lots.expiry_date')
            ->orderBy('inventory_lots.received_at')
            ->select('inventory_lot_balances.*')
            ->lockForUpdate()
            ->get();

        $usable = (float) $lotBalances->sum('available_qty');
        if ($usable < $quantity) {
            throw ValidationException::withMessages([
                'quantity' => "Only {$usable} units are available in non-expired lots.",
            ]);
        }

        $remaining = $quantity;
        $allocations = collect();

        foreach ($lotBalances as $lotBalance) {
            if ($remaining <= 0) {
                break;
            }

            $deduction = min((float) $lotBalance->available_qty, $remaining);
            $lotBalance->decrement('available_qty', $deduction);
            $remaining -= $deduction;

            InventoryLotMovement::create([
                'inventory_lot_id' => $lotBalance->inventory_lot_id,
                'from_storage_location_id' => $storageLocationId,
                'movement_type' => $movementType,
                'quantity' => -$deduction,
                'reference_type' => $reference::class,
                'reference_id' => $reference->getKey(),
                'created_by' => $createdBy,
            ]);

            $allocations->push(['lot' => $lotBalance->lot, 'quantity' => $deduction]);
        }

        self::refreshNearestExpiry($storageLocationId, $ingredientId);

        return $allocations;
    }

    public static function addExistingLotToStorage(
        InventoryLot $lot,
        string $storageLocationId,
        float $quantity,
        string $movementType,
        Model $reference,
        ?string $createdBy
    ): void {
        $balance = InventoryLotBalance::firstOrCreate(
            ['inventory_lot_id' => $lot->id, 'storage_location_id' => $storageLocationId],
            ['available_qty' => 0, 'reserved_qty' => 0]
        );
        $balance->increment('available_qty', $quantity);

        InventoryLotMovement::create([
            'inventory_lot_id' => $lot->id,
            'to_storage_location_id' => $storageLocationId,
            'movement_type' => $movementType,
            'quantity' => $quantity,
            'reference_type' => $reference::class,
            'reference_id' => $reference->getKey(),
            'created_by' => $createdBy,
        ]);

        self::refreshNearestExpiry($storageLocationId, $lot->ingredient_id);
    }

    public static function refreshNearestExpiry(string $storageLocationId, string $ingredientId): void
    {
        $nearest = InventoryLotBalance::query()
            ->where('inventory_lot_balances.storage_location_id', $storageLocationId)
            ->where('inventory_lot_balances.available_qty', '>', 0)
            ->join('inventory_lots', 'inventory_lots.id', '=', 'inventory_lot_balances.inventory_lot_id')
            ->where('inventory_lots.ingredient_id', $ingredientId)
            ->where('inventory_lots.status', 'available')
            ->whereNotNull('inventory_lots.expiry_date')
            ->min('inventory_lots.expiry_date');

        InventoryBalance::where('storage_location_id', $storageLocationId)
            ->where('ingredient_id', $ingredientId)
            ->update(['nearest_expiry_date' => $nearest]);
    }
}

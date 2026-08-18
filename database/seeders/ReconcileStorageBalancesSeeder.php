<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryBalance;
use App\Models\InventoryLedger;
use App\Models\StorageLocation;
use Illuminate\Support\Facades\DB;

class ReconcileStorageBalancesSeeder extends Seeder
{
    /**
     * Run the database seeds to reconcile legacy negative storage balances.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // Find all inventory balances where available_qty < 0
            $negativeBalances = InventoryBalance::with(['storageLocation', 'ingredient'])
                ->where('available_qty', '<', 0)
                ->get();

            $reconciledCount = 0;

            foreach ($negativeBalances as $negBal) {
                if (!$negBal->storageLocation) {
                    continue;
                }

                $locationId = $negBal->storageLocation->business_location_id;
                $ingredientId = $negBal->ingredient_id;
                $deficit = abs((float) $negBal->available_qty); // e.g. 20.00

                // Find another storage location in the SAME branch with positive stock for this ingredient
                $positiveBalances = InventoryBalance::whereHas('storageLocation', function ($q) use ($locationId) {
                    $q->where('business_location_id', $locationId);
                })
                ->where('ingredient_id', $ingredientId)
                ->where('id', '!=', $negBal->id)
                ->where('available_qty', '>', 0)
                ->orderByDesc('available_qty')
                ->get();

                $remainingDeficit = $deficit;

                foreach ($positiveBalances as $posBal) {
                    if ($remainingDeficit <= 0) {
                        break;
                    }

                    $availableToOffset = (float) $posBal->available_qty;
                    $offsetQty = min($remainingDeficit, $availableToOffset);

                    // Offset positive storage balance
                    $posBal->decrement('available_qty', $offsetQty);
                    
                    // Offset negative storage balance
                    $negBal->increment('available_qty', $offsetQty);

                    $remainingDeficit -= $offsetQty;

                    // Log ledger adjustment for donor storage location
                    InventoryLedger::create([
                        'business_location_id' => $locationId,
                        'storage_location_id' => $posBal->storage_location_id,
                        'ingredient_id' => $ingredientId,
                        'transaction_type' => 'balance_reconciliation',
                        'reference_type' => StorageLocation::class,
                        'reference_id' => $posBal->storage_location_id,
                        'quantity' => -$offsetQty,
                        'running_balance' => $posBal->fresh()->available_qty,
                        'created_by' => auth()->id() ?? \App\Models\User::first()?->id,
                    ]);

                    // Log ledger adjustment for recipient storage location
                    InventoryLedger::create([
                        'business_location_id' => $locationId,
                        'storage_location_id' => $negBal->storage_location_id,
                        'ingredient_id' => $ingredientId,
                        'transaction_type' => 'balance_reconciliation',
                        'reference_type' => StorageLocation::class,
                        'reference_id' => $negBal->storage_location_id,
                        'quantity' => $offsetQty,
                        'running_balance' => $negBal->fresh()->available_qty,
                        'created_by' => auth()->id() ?? \App\Models\User::first()?->id,
                    ]);

                    $reconciledCount++;
                }

                // If still negative and no positive balance exists in branch, reset to 0 to prevent negative UI numbers
                if ($negBal->fresh()->available_qty < 0) {
                    $adjustment = abs((float) $negBal->fresh()->available_qty);
                    $negBal->update(['available_qty' => 0]);

                    InventoryLedger::create([
                        'business_location_id' => $locationId,
                        'storage_location_id' => $negBal->storage_location_id,
                        'ingredient_id' => $ingredientId,
                        'transaction_type' => 'balance_reconciliation',
                        'reference_type' => StorageLocation::class,
                        'reference_id' => $negBal->storage_location_id,
                        'quantity' => $adjustment,
                        'running_balance' => 0,
                        'created_by' => auth()->id() ?? \App\Models\User::first()?->id,
                    ]);
                }
            }

            $this->command?->info("Reconciled {$reconciledCount} storage balance discrepancies.");
        });
    }
}

<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$ir = App\Models\InternalRequest::where('request_number', 'REQ-1785151927')->first();
if ($ir) {
    echo "Deleting IR: " . $ir->request_number . "\n";
    $sto = App\Models\StockTransferOrder::where('internal_request_id', $ir->id)->first();
    if ($sto) {
        echo "Deleting STO: " . $sto->sto_number . "\n";
        
        $grns = App\Models\GoodsReceiptNote::where('stock_transfer_order_id', $sto->id)->get();
        foreach ($grns as $grn) {
            echo "Deleting GRN: " . $grn->grn_number . "\n";
            // Reverse Ledger (Inward)
            $ledgersIn = App\Models\InventoryLedger::where('reference_type', App\Models\GoodsReceiptNote::class)
                ->where('reference_id', $grn->id)->get();
            foreach($ledgersIn as $l) {
                // Remove from available_qty
                $loc = App\Models\StorageLocation::where('business_location_id', $l->business_location_id)->first();
                if ($loc) {
                    $balance = App\Models\InventoryBalance::where('storage_location_id', $loc->id)
                        ->where('ingredient_id', $l->ingredient_id)->first();
                    if ($balance) {
                        $balance->decrement('available_qty', $l->quantity);
                    }
                }
                $l->delete();
            }
            $grn->items()->delete();
            $grn->delete();
        }

        // Reverse Ledger (Outward)
        $ledgersOut = App\Models\InventoryLedger::where('reference_type', App\Models\StockTransferOrder::class)
            ->where('reference_id', $sto->id)->get();
        
        foreach($ledgersOut as $l) {
            // It's a negative quantity in the ledger
            // We need to add it back to available_qty
            $loc = App\Models\StorageLocation::where('business_location_id', $l->business_location_id)->first();
            if ($loc) {
                $balance = App\Models\InventoryBalance::where('storage_location_id', $loc->id)
                    ->where('ingredient_id', $l->ingredient_id)->first();
                if ($balance) {
                    $balance->decrement('available_qty', $l->quantity); // since quantity is negative, this adds it back
                }
            }
            $l->delete();
        }

        $sto->items()->delete();
        $sto->delete();
    }
    $ir->items()->delete();
    $ir->delete();
    echo "Deleted successfully!\n";
} else {
    echo "No internal request found.\n";
}

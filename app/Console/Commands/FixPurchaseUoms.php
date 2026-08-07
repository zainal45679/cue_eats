<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\UnitOfMeasure;
use App\Models\IngredientSupplier;

class FixPurchaseUoms extends Command
{
    protected $signature = 'seed:fix-purchase-uoms';
    protected $description = 'Update IngredientSupplier purchase UOMs to derived units (KG, L, Box)';

    public function handle()
    {
        $this->info('Fixing purchase UOMs...');

        $gram = UnitOfMeasure::where('code', 'G')->first();
        $kg = UnitOfMeasure::where('code', 'KG')->first();

        $ml = UnitOfMeasure::where('code', 'ML')->first();
        $litre = UnitOfMeasure::where('code', 'L')->first();

        $each = UnitOfMeasure::where('code', 'EA')->first();
        $box = UnitOfMeasure::where('code', 'BX')->first();

        if ($gram && $kg) {
            IngredientSupplier::where('purchase_uom_id', $gram->id)
                ->update(['purchase_uom_id' => $kg->id]);
            $this->info("Updated Gram -> KG");
        }

        if ($ml && $litre) {
            IngredientSupplier::where('purchase_uom_id', $ml->id)
                ->update(['purchase_uom_id' => $litre->id]);
            $this->info("Updated ML -> Litre");
        }

        // We can leave EA as EA or switch to Box if we want everything in bulk. 
        // Let's leave EA as EA for now, or update to Box for logic's sake.
        if ($each && $box) {
            IngredientSupplier::where('purchase_uom_id', $each->id)
                ->update(['purchase_uom_id' => $box->id]);
            $this->info("Updated Each -> Box");
        }

        $this->info('Purchase UOMs successfully updated!');
    }
}

<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Enums\EntityEnum;
use App\Helpers\GateHelper;
use App\Helpers\TableHelper;
use App\Models\InventoryBalance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryBalanceController extends Controller
{
    public function index()
    {
        GateHelper::read(EntityEnum::InventoryBalances);

        $query = InventoryBalance::with(['ingredient.baseUom', 'ingredient.category', 'storageLocation.businessLocation']);

        $activeLocationId = session('active_location_id');
        if (!auth()->user()->hasRole('admin') || $activeLocationId) {
            $locationId = !auth()->user()->hasRole('admin') ? auth()->user()->business_location_id : $activeLocationId;
            $query->whereHas('storageLocation', function($q) use ($locationId) {
                $q->where('business_location_id', $locationId);
            });
        }

        // Clone query before TableHelper applies filters so categories remain global
        $globalQuery = clone $query;
        $data = TableHelper::query($query)->get();

        $allBalances = $globalQuery->with('ingredient.category')->get();
        $balanceCategories = $allBalances->groupBy(function($item) {
            return $item->ingredient?->category?->name;
        })->map->count()->toArray();
        
        $allCategories = \App\Models\IngredientCategory::pluck('name')->toArray();
        
        $cleanCategories = [];
        // First, add all registered categories (even if 0)
        foreach($allCategories as $cat) {
            $cleanCategories[$cat] = $balanceCategories[$cat] ?? 0;
        }
        
        // Then, add any other categories that might exist (e.g. Uncategorized)
        foreach($balanceCategories as $cat => $count) {
            if ($cat && !isset($cleanCategories[$cat])) {
                $cleanCategories[$cat] = $count;
            }
        }
            
        $storageLocationsQuery = \App\Models\StorageLocation::where('status', true);
        if (!auth()->user()->hasRole('admin') || $activeLocationId) {
            $locId = !auth()->user()->hasRole('admin') ? auth()->user()->business_location_id : $activeLocationId;
            if ($locId) {
                $storageLocationsQuery->where('business_location_id', $locId);
            }
        }
        $storageLocations = $storageLocationsQuery->get();

        return Inertia::render('inventory/live-stock/index', [
            'inventoryBalances' => $data,
            'allInventoryBalances' => $allBalances->map(fn($b) => [
                'storage_location_id' => $b->storage_location_id,
                'ingredient_id' => $b->ingredient_id,
                'available_qty' => (float) $b->available_qty,
            ]),
            'serverCategories' => $cleanCategories,
            'totalItemsCount' => $allBalances->count(),
            'storageLocations' => $storageLocations,
            'ingredients' => \App\Models\Ingredient::with('baseUom')->select('id', 'name', 'base_uom_id')->get(),
        ]);
    }
}

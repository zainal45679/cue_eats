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
            
        return Inertia::render('inventory/live-stock/index', [
            'inventoryBalances' => $data,
            'serverCategories' => $cleanCategories,
            'totalItemsCount' => $allBalances->count()
        ]);
    }
}

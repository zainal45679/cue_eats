<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\InventoryLedger;
use Illuminate\Support\Facades\DB;

class InventoryConsumptionController extends Controller
{
    public function index(Request $request)
    {
        $activeLocationId = session('active_location_id');
        $locationId = !auth()->user()->hasRole('admin') ? auth()->user()->business_location_id : $activeLocationId;

        $startDate = $request->input('start_date', now()->startOfDay()->toDateString());
        $endDate = $request->input('end_date', now()->endOfDay()->toDateString());

        $query = InventoryLedger::query()
            ->select(
                'ingredient_id',
                DB::raw('ABS(SUM(quantity)) as total_consumed'),
                DB::raw('COUNT(DISTINCT reference_id) as total_orders')
            )
            ->with(['ingredient.baseUom', 'ingredient.category'])
            ->where('transaction_type', 'sale')
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);

        if ($locationId) {
            $query->where('business_location_id', $locationId);
        }

        $consumptions = $query->groupBy('ingredient_id')
            ->get()
            ->map(function ($item) {
                $costPerUnit = $item->ingredient->cost_per_unit ?? 0;
                $totalCost = $item->total_consumed * $costPerUnit;

                return [
                    'id' => 'ing-' . $item->ingredient_id,
                    'ingredient' => $item->ingredient,
                    'total_consumed' => (float)$item->total_consumed,
                    'total_orders' => (int)$item->total_orders,
                    'total_cost' => $totalCost,
                ];
            });

        // Compute category counts for the sidebar
        $balanceCategories = $consumptions->groupBy(function($item) {
            return $item['ingredient']?->category?->name;
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

        return Inertia::render('inventory/consumption/index', [
            'consumptions' => $consumptions,
            'serverCategories' => $cleanCategories,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }
}

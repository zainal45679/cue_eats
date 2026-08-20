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

        $hasAllDates = $request->boolean('all_dates');
        $startDate = null;
        $endDate = null;

        $baseQuery = InventoryLedger::query()
            ->where('transaction_type', 'sale');

        if (!$hasAllDates) {
            $startDate = $request->input('start_date', now()->startOfDay()->toDateString());
            $endDate = $request->input('end_date', now()->endOfDay()->toDateString());
            $baseQuery->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }

        if ($locationId) {
            $baseQuery->where('business_location_id', $locationId);
        }

        $globalTotalOrders = (clone $baseQuery)->distinct('reference_id')->count('reference_id');

        $query = (clone $baseQuery)
            ->select(
                'ingredient_id',
                DB::raw('ABS(SUM(quantity)) as total_consumed'),
                DB::raw('COUNT(DISTINCT reference_id) as total_orders')
            )
            ->with([
                'ingredient.baseUom',
                'ingredient.category',
                'ingredient.ingredientSuppliers.purchaseUom',
                'ingredient.purchaseOrderItems.purchaseUom',
            ]);

        $consumptions = $query->groupBy('ingredient_id')
            ->get()
            ->map(function ($item) {
                $ingredient = $item->ingredient;
                $baseUnitCost = 0.0;

                if ($ingredient) {
                    // Precedence 1: Active preferred supplier mapping
                    $supplierMapping = $ingredient->ingredientSuppliers
                        ->where('status', true)
                        ->where('is_preferred', true)
                        ->first();

                    // Precedence 2: Active non-preferred supplier mapping fallback
                    if (!$supplierMapping) {
                        $supplierMapping = $ingredient->ingredientSuppliers
                            ->where('status', true)
                            ->first();
                    }

                    if ($supplierMapping) {
                        $supplierPrice = (float) $supplierMapping->price;
                        $purchaseUom = $supplierMapping->purchaseUom;
                        $conversionFactor = ($purchaseUom && (float)$purchaseUom->conversion_factor > 0)
                            ? (float)$purchaseUom->conversion_factor
                            : 1.0;
                        $baseUnitCost = $supplierPrice / $conversionFactor;
                    } else {
                        // Precedence 3: Latest purchase order item price history
                        $poItem = $ingredient->purchaseOrderItems->sortByDesc('id')->first();
                        if ($poItem && (float)$poItem->unit_price > 0) {
                            $poUnitPrice = (float) $poItem->unit_price;
                            $purchaseUom = $poItem->purchaseUom;
                            $conversionFactor = ($purchaseUom && (float)$purchaseUom->conversion_factor > 0)
                                ? (float)$purchaseUom->conversion_factor
                                : 1.0;
                            $baseUnitCost = $poUnitPrice / $conversionFactor;
                        }
                    }
                }

                $totalCost = (float) $item->total_consumed * $baseUnitCost;

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
            'globalTotalOrders' => $globalTotalOrders,
            'serverCategories' => $cleanCategories,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'all_dates' => $hasAllDates,
            ]
        ]);
    }
}

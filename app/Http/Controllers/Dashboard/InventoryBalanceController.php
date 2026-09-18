<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Enums\EntityEnum;
use App\Helpers\GateHelper;
use App\Helpers\TableHelper;
use App\Models\InventoryBalance;
use App\Models\InventoryLotBalance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
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
        if (! request()->filled('sortBy')) {
            $query->orderByDesc('updated_at');
        }
        $data = TableHelper::query($query)
            ->searchColumns(['ingredient.name', 'ingredient.code', 'storageLocation.storage_name', 'ingredient.category.name'])
            ->addCustomFilter('ingredient.name', function ($q, $val) {
                $vals = is_array($val) ? $val : [$val];
                $q->whereHas('ingredient', function ($iq) use ($vals, $val) {
                    $iq->whereIn('name', $vals)
                       ->orWhereIn('id', $vals)
                       ->orWhere('name', 'like', '%'.(is_array($val) ? ($val[0] ?? '') : $val).'%');
                });
            })
            ->addCustomFilter('ingredient', function ($q, $val) {
                $vals = is_array($val) ? $val : [$val];
                $q->whereHas('ingredient', function ($iq) use ($vals, $val) {
                    $iq->whereIn('name', $vals)
                       ->orWhereIn('id', $vals)
                       ->orWhere('name', 'like', '%'.(is_array($val) ? ($val[0] ?? '') : $val).'%');
                });
            })
            ->addCustomFilter('storage_location.storage_name', function ($q, $val) {
                $vals = is_array($val) ? $val : [$val];
                $q->whereHas('storageLocation', function ($lq) use ($vals, $val) {
                    $lq->whereIn('storage_name', $vals)
                       ->orWhereIn('id', $vals)
                       ->orWhere('storage_name', 'like', '%'.(is_array($val) ? ($val[0] ?? '') : $val).'%');
                });
            })
            ->addCustomFilter('storageLocation', function ($q, $val) {
                $vals = is_array($val) ? $val : [$val];
                $q->whereHas('storageLocation', function ($lq) use ($vals, $val) {
                    $lq->whereIn('storage_name', $vals)
                       ->orWhereIn('id', $vals)
                       ->orWhere('storage_name', 'like', '%'.(is_array($val) ? ($val[0] ?? '') : $val).'%');
                });
            })
            ->addCustomFilter('ingredient.category.name', function ($q, $val) {
                $vals = is_array($val) ? $val : [$val];
                $q->whereHas('ingredient.category', function ($cq) use ($vals, $val) {
                    $cq->whereIn('name', $vals)
                       ->orWhereIn('id', $vals)
                       ->orWhere('name', 'like', '%'.(is_array($val) ? ($val[0] ?? '') : $val).'%');
                });
            })
            ->addCustomFilter('category', function ($q, $val) {
                $vals = is_array($val) ? $val : [$val];
                $q->whereHas('ingredient.category', function ($cq) use ($vals, $val) {
                    $cq->whereIn('name', $vals)
                       ->orWhereIn('id', $vals)
                       ->orWhere('name', 'like', '%'.(is_array($val) ? ($val[0] ?? '') : $val).'%');
                });
            })
            ->addCustomFilter('expiry_status', function ($q, $val) {
                $today = now()->toDateString();
                $nearExpiry = now()->addDays(2)->toDateString();
                if ($val === 'expired') {
                    $q->whereNotNull('nearest_expiry_date')->where('nearest_expiry_date', '<', $today);
                } elseif ($val === 'expiring_soon') {
                    $q->whereNotNull('nearest_expiry_date')
                      ->where('nearest_expiry_date', '>=', $today)
                      ->where('nearest_expiry_date', '<=', $nearExpiry);
                } elseif ($val === 'fresh') {
                    $q->whereNotNull('nearest_expiry_date')->where('nearest_expiry_date', '>', $nearExpiry);
                }
            })
            ->get();

        if (Schema::hasTable('inventory_lot_balances')) {
            $rows = collect($data['rows']);
            $lotBalances = InventoryLotBalance::query()
                ->with('lot')
                ->where('available_qty', '>', 0)
                ->whereIn('storage_location_id', $rows->pluck('storage_location_id')->filter()->unique())
                ->whereHas('lot', fn ($lotQuery) => $lotQuery->whereIn('ingredient_id', $rows->pluck('ingredient_id')->filter()->unique()))
                ->get()
                ->groupBy(fn (InventoryLotBalance $lotBalance) =>
                    $lotBalance->lot->ingredient_id . ':' . $lotBalance->storage_location_id
                );

            $rows->each(function (InventoryBalance $balance) use ($lotBalances): void {
                $lots = $lotBalances->get($balance->ingredient_id . ':' . $balance->storage_location_id, collect())
                    ->sortBy(fn (InventoryLotBalance $lotBalance) => $lotBalance->lot->expiry_date?->format('Y-m-d') ?? '9999-12-31')
                    ->map(fn (InventoryLotBalance $lotBalance): array => [
                        'id' => $lotBalance->lot->id,
                        'internal_lot_number' => $lotBalance->lot->internal_lot_number,
                        'batch_number' => $lotBalance->lot->batch_number,
                        'mfg_date' => $lotBalance->lot->mfg_date?->format('Y-m-d'),
                        'expiry_date' => $lotBalance->lot->expiry_date?->format('Y-m-d'),
                        'available_qty' => (float) $lotBalance->available_qty,
                        'traceability_status' => $lotBalance->lot->traceability_status,
                    ])->values()->all();

                $balance->setAttribute('lots', $lots);
            });
        }

        $allBalances = $globalQuery->with('ingredient.category')->get();
        $today = today();
        $nearExpiry = today()->addDays(2);
        $inventoryStats = [
            'total' => $allBalances->count(),
            'inStock' => $allBalances->where('available_qty', '>', 0)->count(),
            'outOfStock' => $allBalances->where('available_qty', '<=', 0)->count(),
            'reserved' => $allBalances->where('reserved_qty', '>', 0)->count(),
            'onOrder' => $allBalances->where('on_order_qty', '>', 0)->count(),
            'expiringSoon' => $allBalances->filter(fn (InventoryBalance $balance): bool =>
                (float) $balance->available_qty > 0
                && $balance->nearest_expiry_date !== null
                && $balance->nearest_expiry_date->betweenIncluded($today, $nearExpiry)
            )->count(),
            'expired' => $allBalances->filter(fn (InventoryBalance $balance): bool =>
                (float) $balance->available_qty > 0
                && $balance->nearest_expiry_date !== null
                && $balance->nearest_expiry_date->lt($today)
            )->count(),
        ];
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
            'inventoryStats' => $inventoryStats,
            'storageLocations' => $storageLocations,
            'ingredients' => \App\Models\Ingredient::with('baseUom')->select('id', 'name', 'base_uom_id')->get(),
        ]);
    }
}

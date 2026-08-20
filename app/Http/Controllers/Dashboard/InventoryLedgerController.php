<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\InventoryLedger;

class InventoryLedgerController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryLedger::with([
            'location', 
            'ingredient.baseUom', 
            'createdBy', 
            'reference' => function ($morphTo) {
                $morphTo->morphWith([
                    \App\Models\OrderItem::class => ['order'],
                ]);
            }
        ]);
        
        $activeLocationId = session('active_location_id');
        if (!auth()->user()->hasRole('admin') || $activeLocationId) {
            $locationId = !auth()->user()->hasRole('admin') ? auth()->user()->business_location_id : $activeLocationId;
            $query->where('business_location_id', $locationId);
        }
        
        if ($request->has('ingredient_id')) {
            $query->where('ingredient_id', $request->ingredient_id);
        }
        
        if ($request->boolean('hide_sales')) {
            $query->where('transaction_type', '!=', 'sale');
        }

        $today = now()->format('Y-m-d');
        $filtersParam = $request->input('filters');
        $filtersArray = is_string($filtersParam) ? json_decode($filtersParam, true) : (is_array($filtersParam) ? $filtersParam : []);
        if (!is_array($filtersArray)) {
            $filtersArray = [];
        }

        $hasCreatedAtFilter = collect($filtersArray)->contains(fn ($f) => isset($f['id']) && $f['id'] === 'created_at');
        $hasAllDates = $request->boolean('all_dates');

        if (!$hasCreatedAtFilter && !$hasAllDates) {
            $filtersArray[] = [
                'id' => 'created_at',
                'value' => [$today, $today],
            ];
            $request->merge(['filters' => json_encode($filtersArray)]);
        }

        foreach ($filtersArray as $f) {
            if (isset($f['id'], $f['value']) && $f['value'] !== null && $f['value'] !== '') {
                $col = $f['id'];
                $val = $f['value'];
                
                if ($col === 'created_at') {
                    if (is_array($val) && count($val) >= 1) {
                        $d1 = isset($val[0]) ? substr((string)$val[0], 0, 10) : null;
                        $d2 = isset($val[1]) ? substr((string)$val[1], 0, 10) : (isset($val[0]) ? substr((string)$val[0], 0, 10) : null);
                        if ($d1 && preg_match('/^\d{4}-\d{2}-\d{2}$/', $d1)) {
                            $start = $d1 . ' 00:00:00';
                            $endDate = ($d2 && preg_match('/^\d{4}-\d{2}-\d{2}$/', $d2)) ? $d2 : $d1;
                            $nextDayEnd = date('Y-m-d 00:00:00', strtotime($endDate . ' +1 day'));
                            $query->where('created_at', '>=', $start)->where('created_at', '<', $nextDayEnd);
                        }
                    } elseif (is_string($val) && preg_match('/^\d{4}-\d{2}-\d{2}$/', trim($val))) {
                        $dateStr = trim($val);
                        $start = $dateStr . ' 00:00:00';
                        $nextDay = date('Y-m-d 00:00:00', strtotime($dateStr . ' +1 day'));
                        $query->where('created_at', '>=', $start)->where('created_at', '<', $nextDay);
                    }
                } else {
                    if (is_array($val)) {
                        if ($val !== []) {
                            $query->whereIn($col, $val);
                        }
                    } else {
                        $query->where($col, $val);
                    }
                }
            }
        }

        $search = $request->input('search');
        if ($search && mb_trim((string)$search) !== '') {
            $searchTerm = mb_trim((string)$search);
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('ingredient', function ($rq) use ($searchTerm) {
                    $rq->where('name', 'like', '%'.$searchTerm.'%')
                      ->orWhere('code', 'like', '%'.$searchTerm.'%');
                })
                ->orWhereHas('storageLocation', function ($rq) use ($searchTerm) {
                    $rq->where('storage_name', 'like', '%'.$searchTerm.'%');
                })
                ->orWhereHas('location', function ($rq) use ($searchTerm) {
                    $rq->where('location_name', 'like', '%'.$searchTerm.'%');
                })
                ->orWhere('transaction_type', 'like', '%'.$searchTerm.'%')
                ->orWhereHas('createdBy', function ($rq) use ($searchTerm) {
                    $rq->where('name', 'like', '%'.$searchTerm.'%');
                })
                ->orWhere('reference_type', 'like', '%'.$searchTerm.'%')
                ->orWhere('reference_id', 'like', '%'.$searchTerm.'%');
            });
        }
        
        $query->latest();

        $statsQuery = clone $query;
        $serverStats = [
            'total' => (clone $statsQuery)->count(),
            'inwards' => (clone $statsQuery)->where('quantity', '>', 0)->count(),
            'outwards' => (clone $statsQuery)->where('quantity', '<', 0)->count(),
            'adjustments' => (clone $statsQuery)->whereIn('transaction_type', ['adjustment_up', 'adjustment_down'])->count(),
            'consumption' => (clone $statsQuery)->where('transaction_type', 'consumption')->count(),
        ];

        $movement = $request->input('movement');
        if ($movement === 'inwards') {
            $query->where('quantity', '>', 0);
        } elseif ($movement === 'outwards') {
            $query->where('quantity', '<', 0);
        }
            
        return Inertia::render('inventory/ledger/index', [
            'ledgers' => \App\Helpers\TableHelper::query($query)
                ->searchColumns([
                    'ingredient.name',
                    'ingredient.code',
                    'storageLocation.storage_name',
                    'location.location_name',
                    'transaction_type',
                    'createdBy.name',
                    'reference_type',
                    'reference_id',
                ])
                ->transform(fn ($ledger): array => $ledger->toArray())
                ->get(),
            'serverStats' => $serverStats,
        ]);
    }
}

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
        $query = InventoryLedger::with(['location', 'ingredient', 'createdBy']);
        
        if (!auth()->user()->hasRole('admin')) {
            $query->where('business_location_id', auth()->user()->business_location_id);
        }
        
        if ($request->has('ingredient_id')) {
            $query->where('ingredient_id', $request->ingredient_id);
        }
        
        $query->latest();
            
        return Inertia::render('inventory/ledger/index', [
            'ledgers' => \App\Helpers\TableHelper::query($query)
                ->searchColumns(['transaction_type', 'reference_type'])
                ->transform(fn ($ledger): array => $ledger->toArray())
                ->get(),
        ]);
    }
}

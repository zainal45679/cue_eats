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

        $query = InventoryBalance::with(['ingredient.baseUom', 'storageLocation.businessLocation']);

        $activeLocationId = session('active_location_id');
        if (!auth()->user()->hasRole('admin') || $activeLocationId) {
            $locationId = !auth()->user()->hasRole('admin') ? auth()->user()->business_location_id : $activeLocationId;
            $query->whereHas('storageLocation', function($q) use ($locationId) {
                $q->where('business_location_id', $locationId);
            });
        }

        $data = TableHelper::query($query)->get();
            
        return Inertia::render('inventory/live-stock/index', [
            'inventoryBalances' => $data
        ]);
    }

}

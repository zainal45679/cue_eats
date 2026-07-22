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

        $data = TableHelper::query(InventoryBalance::with(['ingredient.baseUom', 'storageLocation.businessLocation']))
            ->get();
            
        return Inertia::render('inventory-setup/inventory-balances/index', [
            'inventoryBalances' => $data
        ]);
    }
}

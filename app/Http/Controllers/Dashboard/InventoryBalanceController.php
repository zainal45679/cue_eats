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

        if (!auth()->user()->hasRole('admin')) {
            $query->whereHas('storageLocation', function($q) {
                $q->where('business_location_id', auth()->user()->business_location_id);
            });
        }

        $data = TableHelper::query($query)->get();
            
        return Inertia::render('inventory-setup/inventory-balances/index', [
            'inventoryBalances' => $data
        ]);
    }

    public function create()
    {
        GateHelper::create(EntityEnum::InventoryBalances);

        $storageLocationsQuery = \App\Models\StorageLocation::with('businessLocation');
        if (!auth()->user()->hasRole('admin')) {
            $storageLocationsQuery->where('business_location_id', auth()->user()->business_location_id);
        }

        return Inertia::render('inventory-setup/inventory-balances/add', [
            'ingredients' => \App\Models\Ingredient::all(['id', 'name']),
            'storageLocations' => $storageLocationsQuery->get(['id', 'storage_name as name', 'business_location_id']),
        ]);
    }

    public function store(Request $request)
    {
        GateHelper::create(EntityEnum::InventoryBalances);

        $validated = $request->validate([
            'ingredient_id' => 'required|exists:ingredients,id',
            'storage_location_id' => 'required|exists:storage_locations,id',
            'available_qty' => 'required|numeric|min:0',
            'reserved_qty' => 'required|numeric|min:0',
            'on_order_qty' => 'required|numeric|min:0',
        ]);

        // Check if balance already exists for this ingredient and location
        $exists = InventoryBalance::where('ingredient_id', $validated['ingredient_id'])
            ->where('storage_location_id', $validated['storage_location_id'])
            ->exists();
            
        if ($exists) {
            return back()->withErrors(['ingredient_id' => 'A balance record already exists for this ingredient at the selected location.']);
        }

        InventoryBalance::create($validated);

        return redirect()->route('inventory-balances.index')
            ->with('success', 'Inventory balance added successfully.');
    }

    public function edit(string $uuid)
    {
        GateHelper::update(EntityEnum::InventoryBalances);

        $inventoryBalance = InventoryBalance::where('uuid', $uuid)->firstOrFail();

        $storageLocationsQuery = \App\Models\StorageLocation::with('businessLocation');
        if (!auth()->user()->hasRole('admin')) {
            $storageLocationsQuery->where('business_location_id', auth()->user()->business_location_id);
        }

        return Inertia::render('inventory-setup/inventory-balances/edit', [
            'inventoryBalance' => $inventoryBalance,
            'ingredients' => \App\Models\Ingredient::all(['id', 'name']),
            'storageLocations' => $storageLocationsQuery->get(['id', 'storage_name as name', 'business_location_id']),
        ]);
    }

    public function update(Request $request, string $uuid)
    {
        GateHelper::update(EntityEnum::InventoryBalances);

        $inventoryBalance = InventoryBalance::where('uuid', $uuid)->firstOrFail();

        $validated = $request->validate([
            'ingredient_id' => 'required|exists:ingredients,id',
            'storage_location_id' => 'required|exists:storage_locations,id',
            'available_qty' => 'required|numeric|min:0',
            'reserved_qty' => 'required|numeric|min:0',
            'on_order_qty' => 'required|numeric|min:0',
        ]);

        $exists = InventoryBalance::where('ingredient_id', $validated['ingredient_id'])
            ->where('storage_location_id', $validated['storage_location_id'])
            ->where('id', '!=', $inventoryBalance->id)
            ->exists();
            
        if ($exists) {
            return back()->withErrors(['ingredient_id' => 'A balance record already exists for this ingredient at the selected location.']);
        }

        $inventoryBalance->update($validated);

        return redirect()->route('inventory-balances.index')
            ->with('success', 'Inventory balance updated successfully.');
    }

    public function destroy(string $uuid)
    {
        GateHelper::delete(EntityEnum::InventoryBalances);

        $inventoryBalance = InventoryBalance::where('uuid', $uuid)->firstOrFail();
        $inventoryBalance->delete();

        return redirect()->route('inventory-balances.index')
            ->with('success', 'Inventory balance deleted successfully.');
    }
}

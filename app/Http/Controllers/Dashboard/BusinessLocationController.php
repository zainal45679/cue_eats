<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Enums\EntityEnum;
use App\Helpers\GateHelper;
use App\Helpers\TableHelper;
use App\Http\Controllers\Controller;
use App\Models\BusinessLocation;
use App\Models\Country;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

final class BusinessLocationController extends Controller
{
    public function search(Request $request)
    {
        GateHelper::read(EntityEnum::BusinessLocations);

        return TableHelper::query(BusinessLocation::query()->with(['country', 'parentLocation']))
            ->searchColumns(['location_name', 'location_code', 'location_type'])
            ->get();
    }

    public function index(Request $request)
    {
        GateHelper::read(EntityEnum::BusinessLocations);

        $data = TableHelper::query(BusinessLocation::query()->with(['country', 'parentLocation', 'taxProfile']))
            ->searchColumns(['location_name', 'location_code', 'location_type'])
            ->get();

        return Inertia::render('inventory-setup/business-locations/index', [
            'businessLocations' => $data,
        ]);
    }

    public function create()
    {
        GateHelper::create(EntityEnum::BusinessLocations);

        $countries = Country::where('status', true)->get(['id', 'name']);
        $parentLocations = BusinessLocation::where('is_parent_location', true)->where('status', true)->get(['id', 'location_name']);
        $taxProfiles = \App\Models\CurrencyTax::where('status', true)->get(['id', 'tax_type', 'tax_percentage', 'currency']);

        return Inertia::render('inventory-setup/business-locations/add', [
            'countries' => $countries,
            'parentLocations' => $parentLocations,
            'taxProfiles' => $taxProfiles,
        ]);
    }

    public function store(Request $request)
    {
        GateHelper::create(EntityEnum::BusinessLocations);

        $validated = $request->validate([
            'country_id' => 'required|exists:countries,id',
            'parent_location_id' => 'nullable|exists:business_locations,id',
            'currency_tax_id' => 'nullable|exists:currency_taxes,id',
            'location_name' => 'required|string|max:255',
            'location_code' => 'nullable|string|max:255',
            'location_type' => 'required|string|in:Outlet,Warehouse,Kitchen,Central Store',
            'is_parent_location' => 'boolean',
            'is_inventory_location' => 'boolean',
            'is_purchasing_enabled' => 'boolean',
            'is_sales_enabled' => 'boolean',
            'status' => 'boolean',
        ]);

        BusinessLocation::create($validated);

        return redirect()->route('business-locations.index')
            ->with('success', 'Business location created successfully.');
    }

    public function show(string $id)
    {
        GateHelper::read(EntityEnum::BusinessLocations);

        $businessLocation = BusinessLocation::with(['country', 'parentLocation'])->findOrFail($id);

        return Inertia::render('inventory-setup/business-locations/show', [
            'businessLocation' => $businessLocation,
        ]);
    }

    public function edit(string $id)
    {
        GateHelper::update(EntityEnum::BusinessLocations);

        $businessLocation = BusinessLocation::findOrFail($id);

        $countries = Country::where('status', true)->orWhere('id', $businessLocation->country_id)->get(['id', 'name']);

        $parentLocations = BusinessLocation::where('is_parent_location', true)
            ->where('id', '!=', $businessLocation->id) // Exclude self
            ->get(['id', 'location_name']);
            
        $taxProfiles = \App\Models\CurrencyTax::where('status', true)->orWhere('id', $businessLocation->currency_tax_id)->get(['id', 'tax_type', 'tax_percentage', 'currency']);

        return Inertia::render('inventory-setup/business-locations/edit', [
            'businessLocation' => $businessLocation,
            'countries' => $countries,
            'parentLocations' => $parentLocations,
            'taxProfiles' => $taxProfiles,
        ]);
    }

    public function update(Request $request, string $id)
    {
        GateHelper::update(EntityEnum::BusinessLocations);

        $businessLocation = BusinessLocation::findOrFail($id);

        $validated = $request->validate([
            'country_id' => 'required|exists:countries,id',
            'parent_location_id' => [
                'nullable',
                'exists:business_locations,id',
                Rule::notIn([$businessLocation->id]),
            ],
            'currency_tax_id' => 'nullable|exists:currency_taxes,id',
            'location_name' => 'required|string|max:255',
            'location_code' => 'nullable|string|max:255',
            'location_type' => 'required|string|in:Outlet,Warehouse,Kitchen,Central Store',
            'is_parent_location' => 'boolean',
            'is_inventory_location' => 'boolean',
            'is_purchasing_enabled' => 'boolean',
            'is_sales_enabled' => 'boolean',
            'status' => 'boolean',
        ]);

        $businessLocation->update($validated);

        return redirect()->route('business-locations.index')
            ->with('success', 'Business location updated successfully.');
    }

    public function destroy(string $id)
    {
        GateHelper::delete(EntityEnum::BusinessLocations);

        $businessLocation = BusinessLocation::findOrFail($id);
        $businessLocation->delete();

        return redirect()->route('business-locations.index')
            ->with('success', 'Business location deleted successfully.');
    }
}

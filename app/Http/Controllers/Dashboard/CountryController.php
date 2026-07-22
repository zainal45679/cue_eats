<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Enums\EntityEnum;
use App\Helpers\GateHelper;
use App\Helpers\TableHelper;
use App\Http\Controllers\Controller;
use App\Models\Country;
use Illuminate\Http\Request;
use Inertia\Inertia;

final class CountryController extends Controller
{
    public function index()
    {
        GateHelper::read(EntityEnum::Countries);

        $countryData = TableHelper::query(Country::query())
            ->searchColumns(['name'])
            ->get();

        return Inertia::render('inventory-setup/countries/index', [
            'countries' => $countryData,
        ]);
    }

    public function create()
    {
        return Inertia::render('inventory-setup/countries/add', []);
    }

    public function store(Request $request)
    {
        GateHelper::create(EntityEnum::Countries);

        $request->validate([
            'name' => 'required|string|max:255|unique:countries,name',
            'status' => 'boolean',
        ]);

        Country::create($request->only(['name', 'status']));

        return redirect()->route('countries.index')->with('success', 'Country created successfully!');
    }

    public function show($id)
    {
        $country = Country::findOrFail($id);

        return Inertia::render('inventory-setup/countries/show', [
            'country' => $country,
        ]);
    }

    public function edit($id)
    {
        $country = Country::findOrFail($id);

        return Inertia::render('inventory-setup/countries/edit', [
            'country' => $country,
        ]);
    }

    public function update(Request $request, string $id)
    {
        GateHelper::update(EntityEnum::Countries);

        $request->validate([
            'name' => 'required|string|max:255|unique:countries,name,'.$id,
            'status' => 'boolean',
        ]);

        $country = Country::findOrFail($id);
        $country->update($request->only(['name', 'status']));

        return redirect()->route('countries.index')->with('success', 'Country updated successfully');
    }

    public function destroy($id)
    {
        GateHelper::delete(EntityEnum::Countries);
        $country = Country::findOrFail($id);
        $country->delete();

        return redirect()->route('countries.index')->with('success', 'Country deleted successfully');
    }

    public function search(Request $request)
    {
        $query = Country::query();
        if ($request->has('q') && ! empty($request->q)) {
            $query->where('name', 'like', '%'.$request->q.'%');
        }
        $countries = $query->limit(50)->get(['id', 'name', 'status']);

        return response()->json($countries);
    }
}

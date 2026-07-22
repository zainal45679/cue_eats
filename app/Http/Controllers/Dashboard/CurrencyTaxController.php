<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Enums\EntityEnum;
use App\Helpers\GateHelper;
use App\Helpers\TableHelper;
use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\CurrencyTax;
use Illuminate\Http\Request;
use Inertia\Inertia;

final class CurrencyTaxController extends Controller
{
    public function index()
    {
        GateHelper::read(EntityEnum::CurrencyTax);

        $data = TableHelper::query(CurrencyTax::query()->with('country'))
            ->searchColumns(['currency', 'tax_type'])
            ->get();

        return Inertia::render('inventory-setup/currency-tax/index', [
            'currencyTaxes' => $data,
        ]);
    }

    public function create()
    {
        $countries = Country::whereDoesntHave('currencyTax')->where('status', true)->get(['id', 'name']);

        return Inertia::render('inventory-setup/currency-tax/add', [
            'countries' => $countries,
        ]);
    }

    public function store(Request $request)
    {
        GateHelper::create(EntityEnum::CurrencyTax);

        $request->validate([
            'country_id' => 'required|exists:countries,id|unique:currency_taxes,country_id',
            'currency' => 'required|string|max:255',
            'tax_type' => 'required|string|in:GST,VAT',
            'tax_percentage' => 'nullable|numeric|min:0|max:100',
            'status' => 'boolean',
        ]);

        CurrencyTax::create($request->only(['country_id', 'currency', 'tax_type', 'tax_percentage', 'status']));

        return redirect()->route('currency-tax.index')->with('success', 'Currency & Tax created successfully!');
    }

    public function show($id)
    {
        $currencyTax = CurrencyTax::with('country')->findOrFail($id);

        return Inertia::render('inventory-setup/currency-tax/show', [
            'currencyTax' => $currencyTax,
        ]);
    }

    public function edit($id)
    {
        $currencyTax = CurrencyTax::findOrFail($id);

        $countries = Country::where(function ($query) {
            $query->whereDoesntHave('currencyTax')->where('status', true);
        })->orWhere('id', $currencyTax->country_id)->get(['id', 'name']);

        return Inertia::render('inventory-setup/currency-tax/edit', [
            'currencyTax' => $currencyTax,
            'countries' => $countries,
        ]);
    }

    public function update(Request $request, string $id)
    {
        GateHelper::update(EntityEnum::CurrencyTax);

        $request->validate([
            'country_id' => 'required|exists:countries,id|unique:currency_taxes,country_id,'.$id,
            'currency' => 'required|string|max:255',
            'tax_type' => 'required|string|in:GST,VAT',
            'tax_percentage' => 'nullable|numeric|min:0|max:100',
            'status' => 'boolean',
        ]);

        $currencyTax = CurrencyTax::findOrFail($id);
        $currencyTax->update($request->only(['country_id', 'currency', 'tax_type', 'tax_percentage', 'status']));

        return redirect()->route('currency-tax.index')->with('success', 'Currency & Tax updated successfully');
    }

    public function destroy($id)
    {
        GateHelper::delete(EntityEnum::CurrencyTax);
        $currencyTax = CurrencyTax::findOrFail($id);
        $currencyTax->delete();

        return redirect()->route('currency-tax.index')->with('success', 'Currency & Tax deleted successfully');
    }

    public function search(Request $request)
    {
        $query = CurrencyTax::query()->with('country');
        if ($request->has('q') && ! empty($request->q)) {
            $query->where('currency', 'like', '%'.$request->q.'%')
                ->orWhere('tax_type', 'like', '%'.$request->q.'%');
        }
        $currencyTaxes = $query->limit(50)->get(['id', 'currency', 'tax_type', 'tax_percentage', 'country_id', 'status']);

        return response()->json($currencyTaxes);
    }
}

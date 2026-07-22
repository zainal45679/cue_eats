<?php

namespace App\Http\Controllers\Dashboard;

use App\Enums\EntityEnum;
use App\Helpers\GateHelper;
use App\Helpers\TableHelper;
use App\Http\Controllers\Controller;
use App\Models\CurrencyTax;
use App\Models\Ingredient;
use App\Models\IngredientSupplier;
use App\Models\Supplier;
use App\Models\UnitOfMeasure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

final class IngredientSupplierController extends Controller
{
    public function index()
    {
        GateHelper::read(EntityEnum::IngredientSuppliers);

        $query = IngredientSupplier::query()
            ->with(['ingredient', 'supplier', 'purchaseUom', 'currencyTax']);

        $data = TableHelper::query($query)
            ->searchColumns(['ingredient.name', 'supplier.name'])
            ->get();

        return Inertia::render('supply-chain/ingredient-supplier/index', [
            'mappings' => $data,
        ]);
    }

    public function create()
    {
        GateHelper::create(EntityEnum::IngredientSuppliers);

        return Inertia::render('supply-chain/ingredient-supplier/add', $this->getFormData());
    }

    public function store(Request $request)
    {
        GateHelper::create(EntityEnum::IngredientSuppliers);

        $validated = $request->validate([
            'ingredient_id' => [
                'required',
                'exists:ingredients,id',
                Rule::unique('ingredient_suppliers')->where(function ($query) use ($request) {
                    return $query->where('supplier_id', $request->supplier_id);
                })
            ],
            'supplier_id' => 'required|exists:suppliers,id',
            'purchase_uom_id' => 'required|exists:units_of_measure,id',
            'moq' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'currency_tax_id' => 'nullable|exists:currency_taxes,id',
            'lead_time_days' => 'required|integer|min:0',
            'is_preferred' => 'boolean',
            'status' => 'boolean',
        ], [
            'ingredient_id.unique' => 'This ingredient is already mapped to the selected supplier.',
        ]);

        IngredientSupplier::create($validated);

        return redirect()->route('ingredient-suppliers.index')
            ->with('success', 'Mapping created successfully.');
    }

    public function edit(string $uuid)
    {
        GateHelper::update(EntityEnum::IngredientSuppliers);

        $mapping = IngredientSupplier::where('uuid', $uuid)->firstOrFail();

        return Inertia::render('supply-chain/ingredient-supplier/edit', [
            'mapping' => $mapping,
            ...$this->getFormData()
        ]);
    }

    public function update(Request $request, string $uuid)
    {
        GateHelper::update(EntityEnum::IngredientSuppliers);

        $mapping = IngredientSupplier::where('uuid', $uuid)->firstOrFail();

        $validated = $request->validate([
            'ingredient_id' => [
                'required',
                'exists:ingredients,id',
                Rule::unique('ingredient_suppliers')->where(function ($query) use ($request) {
                    return $query->where('supplier_id', $request->supplier_id);
                })->ignore($mapping->id)
            ],
            'supplier_id' => 'required|exists:suppliers,id',
            'purchase_uom_id' => 'required|exists:units_of_measure,id',
            'moq' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'currency_tax_id' => 'nullable|exists:currency_taxes,id',
            'lead_time_days' => 'required|integer|min:0',
            'is_preferred' => 'boolean',
            'status' => 'boolean',
        ], [
            'ingredient_id.unique' => 'This ingredient is already mapped to the selected supplier.',
        ]);

        $mapping->update($validated);

        return redirect()->route('ingredient-suppliers.index')
            ->with('success', 'Mapping updated successfully.');
    }

    public function destroy(string $uuid)
    {
        GateHelper::delete(EntityEnum::IngredientSuppliers);

        $mapping = IngredientSupplier::where('uuid', $uuid)->firstOrFail();
        $mapping->delete();

        return redirect()->route('ingredient-suppliers.index')
            ->with('success', 'Mapping deleted successfully.');
    }

    private function getFormData(): array
    {
        return [
            'ingredients' => Ingredient::where('status', true)->get(['id', 'name', 'code']),
            'suppliers' => Supplier::where('status', true)->get(['id', 'name']),
            'uoms' => UnitOfMeasure::where('status', true)->get(['id', 'name', 'code']),
            'currencies' => CurrencyTax::where('status', true)->get(['id', 'currency', 'tax_percentage']),
        ];
    }
}

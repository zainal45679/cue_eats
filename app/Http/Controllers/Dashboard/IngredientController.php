<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Enums\EntityEnum;
use App\Helpers\GateHelper;
use App\Helpers\TableHelper;
use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Ingredient;
use App\Models\IngredientCategory;
use App\Models\UnitOfMeasure;
use Illuminate\Http\Request;
use Inertia\Inertia;

final class IngredientController extends Controller
{
    public function index()
    {
        GateHelper::read(EntityEnum::Ingredients);

        $data = TableHelper::query(Ingredient::query()->with(['category', 'baseUom', 'brand']))
            ->searchColumns(['name', 'code'])
            ->get();

        return Inertia::render('supply-chain/ingredients/index', [
            'ingredients' => $data,
        ]);
    }

    public function create()
    {
        GateHelper::create(EntityEnum::Ingredients);

        return Inertia::render('supply-chain/ingredients/add', [
            'categories' => IngredientCategory::where('status', true)->get(['id', 'name']),
            'brands' => Brand::where('status', true)->get(['id', 'name']),
            'uoms' => UnitOfMeasure::where('status', true)->get(['id', 'name', 'code']),
        ]);
    }

    public function store(Request $request)
    {
        GateHelper::create(EntityEnum::Ingredients);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:255',
            'ingredient_category_id' => 'nullable|exists:ingredient_categories,id',
            'base_uom_id' => 'nullable|exists:units_of_measure,id',
            'brand_id' => 'nullable|exists:brands,id',
            'is_inventory_item' => 'boolean',
            'is_purchasable' => 'boolean',
            'is_recipe_item' => 'boolean',
            'status' => 'boolean',
        ]);

        Ingredient::create($validated);

        return redirect()->route('ingredients.index')
            ->with('success', 'Ingredient created successfully.');
    }

    public function edit(string $uuid)
    {
        GateHelper::update(EntityEnum::Ingredients);

        $ingredient = Ingredient::where('uuid', $uuid)->firstOrFail();

        return Inertia::render('supply-chain/ingredients/edit', [
            'ingredient' => $ingredient,
            'categories' => IngredientCategory::where('status', true)->get(['id', 'name']),
            'brands' => Brand::where('status', true)->get(['id', 'name']),
            'uoms' => UnitOfMeasure::where('status', true)->get(['id', 'name', 'code']),
        ]);
    }

    public function update(Request $request, string $uuid)
    {
        GateHelper::update(EntityEnum::Ingredients);

        $ingredient = Ingredient::where('uuid', $uuid)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:255',
            'ingredient_category_id' => 'nullable|exists:ingredient_categories,id',
            'base_uom_id' => 'nullable|exists:units_of_measure,id',
            'brand_id' => 'nullable|exists:brands,id',
            'is_inventory_item' => 'boolean',
            'is_purchasable' => 'boolean',
            'is_recipe_item' => 'boolean',
            'status' => 'boolean',
        ]);

        $ingredient->update($validated);

        return redirect()->route('ingredients.index')
            ->with('success', 'Ingredient updated successfully.');
    }

    public function destroy(string $uuid)
    {
        GateHelper::delete(EntityEnum::Ingredients);

        $ingredient = Ingredient::where('uuid', $uuid)->firstOrFail();
        
        try {
            $ingredient->delete();
            return redirect()->route('ingredients.index')
                ->with('success', 'Ingredient deleted successfully.');
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23000') {
                return redirect()->back()
                    ->with('error', 'Cannot delete this ingredient because it is used in existing transactions or recipes.');
            }
            throw $e;
        }
    }

    public function search(Request $request)
    {
        $query = Ingredient::with(['baseUom'])->where('status', true);

        if ($request->has('q') && ! empty($request->q)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->q . '%')
                  ->orWhere('code', 'like', '%' . $request->q . '%');
            });
        }

        return response()->json($query->limit(50)->get(['id', 'name', 'code', 'base_uom_id']));
    }
}

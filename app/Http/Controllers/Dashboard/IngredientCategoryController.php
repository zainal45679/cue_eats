<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Enums\EntityEnum;
use App\Helpers\GateHelper;
use App\Helpers\TableHelper;
use App\Http\Controllers\Controller;
use App\Models\IngredientCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

final class IngredientCategoryController extends Controller
{
    public function search(Request $request)
    {
        GateHelper::read(EntityEnum::IngredientCategories);

        return TableHelper::query(IngredientCategory::query()->with('parentCategory'))
            ->searchColumns(['name'])
            ->get();
    }

    public function index(Request $request)
    {
        GateHelper::read(EntityEnum::IngredientCategories);

        $data = TableHelper::query(IngredientCategory::query()->with('parentCategory'))
            ->searchColumns(['name'])
            ->get();

        return Inertia::render('supply-chain/ingredient-categories/index', [
            'categories' => $data,
        ]);
    }

    public function create()
    {
        GateHelper::create(EntityEnum::IngredientCategories);

        $parentCategories = IngredientCategory::where('status', true)->get(['id', 'name']);

        return Inertia::render('supply-chain/ingredient-categories/add', [
            'parentCategories' => $parentCategories,
        ]);
    }

    public function store(Request $request)
    {
        GateHelper::create(EntityEnum::IngredientCategories);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_category_id' => 'nullable|exists:ingredient_categories,id',
            'status' => 'boolean',
        ]);

        IngredientCategory::create($validated);

        return redirect()->route('ingredient-categories.index')
            ->with('success', 'Category created successfully.');
    }

    public function edit(string $uuid)
    {
        GateHelper::update(EntityEnum::IngredientCategories);

        $category = IngredientCategory::where('uuid', $uuid)->firstOrFail();
        $parentCategories = IngredientCategory::where('status', true)
            ->where('id', '!=', $category->id)
            ->get(['id', 'name']);

        return Inertia::render('supply-chain/ingredient-categories/edit', [
            'category' => $category,
            'parentCategories' => $parentCategories,
        ]);
    }

    public function update(Request $request, string $uuid)
    {
        GateHelper::update(EntityEnum::IngredientCategories);

        $category = IngredientCategory::where('uuid', $uuid)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_category_id' => [
                'nullable',
                'exists:ingredient_categories,id',
                Rule::notIn([$category->id]),
            ],
            'status' => 'boolean',
        ]);

        $category->update($validated);

        return redirect()->route('ingredient-categories.index')
            ->with('success', 'Category updated successfully.');
    }

    public function destroy(string $uuid)
    {
        GateHelper::delete(EntityEnum::IngredientCategories);

        $category = IngredientCategory::where('uuid', $uuid)->firstOrFail();
        
        try {
            $category->delete();
            return redirect()->route('ingredient-categories.index')
                ->with('success', 'Category deleted successfully.');
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23000') {
                return redirect()->back()
                    ->with('error', 'Cannot delete this category because it is used in existing ingredients or sub-categories.');
            }
            throw $e;
        }
    }
}

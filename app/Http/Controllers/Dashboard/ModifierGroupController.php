<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\ModifierGroup;
use App\Models\Modifier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ModifierGroupController extends Controller
{
    public function index()
    {
        $modifierGroups = ModifierGroup::with('modifiers')->get();
        return Inertia::render('menu-pos/modifiers/index', [
            'modifierGroups' => $modifierGroups
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_required' => 'boolean',
            'min_selections' => 'required|integer|min:0',
            'max_selections' => 'required|integer|min:1',
            'modifiers' => 'nullable|array',
            'modifiers.*.name' => 'required|string|max:255',
            'modifiers.*.price_adjustment' => 'required|numeric',
            'modifiers.*.recipe_items' => 'nullable|array',
            'modifiers.*.recipe_items.*.ingredient_id' => 'required|exists:ingredients,id',
            'modifiers.*.recipe_items.*.quantity' => 'required|numeric|min:0',
        ]);
        
        $group = ModifierGroup::create(collect($validated)->except('modifiers')->toArray());
        
        if (!empty($validated['modifiers'])) {
            foreach ($validated['modifiers'] as $modData) {
                $modifier = $group->modifiers()->create([
                    'name' => $modData['name'],
                    'price_adjustment' => $modData['price_adjustment'],
                ]);
                
                if (!empty($modData['recipe_items'])) {
                    foreach ($modData['recipe_items'] as $recipeItem) {
                        $modifier->recipeItems()->create([
                            'ingredient_id' => $recipeItem['ingredient_id'],
                            'quantity' => $recipeItem['quantity'],
                        ]);
                    }
                }
            }
        }

        return back()->with('success', 'Modifier Group created.');
    }

    public function update(Request $request, ModifierGroup $modifier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_required' => 'boolean',
            'min_selections' => 'required|integer|min:0',
            'max_selections' => 'required|integer|min:1',
            'modifiers' => 'nullable|array',
            'modifiers.*.id' => 'nullable|exists:modifiers,id',
            'modifiers.*.name' => 'required|string|max:255',
            'modifiers.*.price_adjustment' => 'required|numeric',
            'modifiers.*.recipe_items' => 'nullable|array',
            'modifiers.*.recipe_items.*.ingredient_id' => 'required|exists:ingredients,id',
            'modifiers.*.recipe_items.*.quantity' => 'required|numeric|min:0',
        ]);
        
        $modifier->update(collect($validated)->except('modifiers')->toArray());
        
        // Update modifiers
        if (isset($validated['modifiers'])) {
            $existingIds = collect($validated['modifiers'])->pluck('id')->filter()->all();
            $modifier->modifiers()->whereNotIn('id', $existingIds)->delete();

            foreach ($validated['modifiers'] as $modData) {
                if (!empty($modData['id'])) {
                    $mod = $modifier->modifiers()->where('id', $modData['id'])->first();
                    $mod->update([
                        'name' => $modData['name'],
                        'price_adjustment' => $modData['price_adjustment'],
                    ]);
                } else {
                    $mod = $modifier->modifiers()->create([
                        'name' => $modData['name'],
                        'price_adjustment' => $modData['price_adjustment'],
                    ]);
                }
                
                if (isset($modData['recipe_items']) && is_array($modData['recipe_items'])) {
                    $mod->recipeItems()->delete();
                    foreach ($modData['recipe_items'] as $recipeItem) {
                        $mod->recipeItems()->create([
                            'ingredient_id' => $recipeItem['ingredient_id'],
                            'quantity' => $recipeItem['quantity'],
                        ]);
                    }
                } else if (array_key_exists('recipe_items', $modData)) {
                    $mod->recipeItems()->delete();
                }
            }
        }

        return back()->with('success', 'Modifier Group updated.');
    }

    public function destroy(ModifierGroup $modifier)
    {
        $modifier->delete();
        return back()->with('success', 'Modifier Group deleted.');
    }
}

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
        ]);
        
        $group = ModifierGroup::create($validated);
        
        if (!empty($validated['modifiers'])) {
            $group->modifiers()->createMany($validated['modifiers']);
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
        ]);
        
        $modifier->update($validated);
        
        // Update modifiers
        if (isset($validated['modifiers'])) {
            $existingIds = collect($validated['modifiers'])->pluck('id')->filter()->all();
            $modifier->modifiers()->whereNotIn('id', $existingIds)->delete();

            foreach ($validated['modifiers'] as $modData) {
                if (!empty($modData['id'])) {
                    $modifier->modifiers()->where('id', $modData['id'])->update([
                        'name' => $modData['name'],
                        'price_adjustment' => $modData['price_adjustment'],
                    ]);
                } else {
                    $modifier->modifiers()->create([
                        'name' => $modData['name'],
                        'price_adjustment' => $modData['price_adjustment'],
                    ]);
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

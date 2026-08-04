<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\MenuCategory;
use App\Models\ModifierGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuItemController extends Controller
{
    public function index()
    {
        $items = MenuItem::with(['category', 'modifierGroups'])->get();
        $categories = MenuCategory::all();
        $modifierGroups = ModifierGroup::all();
        
        return Inertia::render('menu-pos/items/index', [
            'items' => $items,
            'categories' => $categories,
            'modifierGroups' => $modifierGroups
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'menu_category_id' => 'required|exists:menu_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|max:5120',
            'is_active' => 'boolean',
            'is_available' => 'boolean',
            'modifier_group_ids' => 'nullable|array',
            'modifier_group_ids.*' => 'exists:modifier_groups,id'
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('menu-items', 'public');
        }
        
        $item = MenuItem::create(collect($validated)->except('modifier_group_ids')->toArray());
        
        if (isset($validated['modifier_group_ids'])) {
            $item->modifierGroups()->sync($validated['modifier_group_ids']);
        }

        return back()->with('success', 'Menu Item created.');
    }

    public function update(Request $request, MenuItem $item)
    {
        $validated = $request->validate([
            'menu_category_id' => 'required|exists:menu_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable',
            'is_active' => 'boolean',
            'is_available' => 'boolean',
            'modifier_group_ids' => 'nullable|array',
            'modifier_group_ids.*' => 'exists:modifier_groups,id'
        ]);
        
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('menu-items', 'public');
        } else if (!isset($validated['image']) || $validated['image'] === 'null' || $validated['image'] === null) {
             // If explicitly cleared, we should remove the image.
             // If it's a string, it means the old image path was sent back, which is fine, we just keep it.
             if (is_null($request->input('image')) || $request->input('image') === 'null') {
                 $validated['image'] = null;
             } else {
                 unset($validated['image']);
             }
        } else {
            unset($validated['image']);
        }
        
        $item->update(collect($validated)->except('modifier_group_ids')->toArray());
        
        if (isset($validated['modifier_group_ids'])) {
            $item->modifierGroups()->sync($validated['modifier_group_ids']);
        } else {
            $item->modifierGroups()->sync([]);
        }

        return back()->with('success', 'Menu Item updated.');
    }

    public function destroy(MenuItem $item)
    {
        $item->delete();
        return back()->with('success', 'Menu Item deleted.');
    }
}

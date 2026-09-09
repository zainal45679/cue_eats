<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\MenuCategory;
use App\Models\MenuItemVariant;
use App\Models\ModifierGroup;
use App\Models\OutletMenuItemOverride;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;

class MenuItemController extends Controller
{
    public function index()
    {
        $items = MenuItem::with(['category', 'modifierGroups', 'variants'])->get();
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
            'sub_category_id' => 'nullable|exists:menu_categories,id',
            'item_code' => 'nullable|string|max:50',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|max:5120',
            'is_active' => 'boolean',
            'is_available' => 'boolean',
            'food_type' => 'required|string|in:veg,non_veg,egg,vegan',
            'spice_level' => 'integer|min:0|max:3',
            'is_chef_special' => 'boolean',
            'is_best_seller' => 'boolean',
            'is_jain' => 'boolean',
            'is_tax_inclusive' => 'boolean',
            'tax_rate' => 'numeric|min:0|max:100',
            'kitchen_station_id' => 'nullable|exists:kitchen_stations,id',
            'channel_prices' => 'nullable|array',
            'has_variants' => 'boolean',
            'variants' => 'nullable|array',
            'variants.*.name' => 'required_with:variants|string',
            'variants.*.price' => 'required_with:variants|numeric|min:0',
            'variants.*.item_code' => 'nullable|string',
            'modifier_group_ids' => 'nullable|array',
            'modifier_group_ids.*' => 'exists:modifier_groups,id',
            'recipe_items' => 'nullable|array',
            'recipe_items.*.ingredient_id' => 'required|exists:ingredients,id',
            'recipe_items.*.quantity' => 'required|numeric|min:0',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('menu-items', 'public');
        }
        
        $itemData = collect($validated)->except(['modifier_group_ids', 'variants', 'recipe_items'])->toArray();
        $item = MenuItem::create($itemData);
        
        if (!empty($validated['has_variants']) && isset($validated['variants']) && is_array($validated['variants'])) {
            foreach ($validated['variants'] as $idx => $v) {
                $item->variants()->create([
                    'name' => $v['name'],
                    'price' => $v['price'],
                    'item_code' => $v['item_code'] ?? null,
                    'sort_order' => $idx,
                    'is_available' => true,
                ]);
            }
        }

        if (isset($validated['modifier_group_ids'])) {
            $item->modifierGroups()->sync($validated['modifier_group_ids']);
        }

        if (isset($validated['recipe_items']) && is_array($validated['recipe_items'])) {
            foreach ($validated['recipe_items'] as $recipeItem) {
                $item->recipeItems()->create([
                    'ingredient_id' => $recipeItem['ingredient_id'],
                    'quantity' => $recipeItem['quantity'],
                ]);
            }
        }

        return back()->with('success', 'Menu Item created.');
    }

    public function update(Request $request, MenuItem $item)
    {
        $validated = $request->validate([
            'menu_category_id' => 'required|exists:menu_categories,id',
            'sub_category_id' => 'nullable|exists:menu_categories,id',
            'item_code' => 'nullable|string|max:50',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable',
            'is_active' => 'boolean',
            'is_available' => 'boolean',
            'food_type' => 'required|string|in:veg,non_veg,egg,vegan',
            'spice_level' => 'integer|min:0|max:3',
            'is_chef_special' => 'boolean',
            'is_best_seller' => 'boolean',
            'is_jain' => 'boolean',
            'is_tax_inclusive' => 'boolean',
            'tax_rate' => 'numeric|min:0|max:100',
            'kitchen_station_id' => 'nullable|exists:kitchen_stations,id',
            'channel_prices' => 'nullable|array',
            'has_variants' => 'boolean',
            'variants' => 'nullable|array',
            'modifier_group_ids' => 'nullable|array',
            'modifier_group_ids.*' => 'exists:modifier_groups,id',
            'recipe_items' => 'nullable|array',
            'recipe_items.*.ingredient_id' => 'required|exists:ingredients,id',
            'recipe_items.*.quantity' => 'required|numeric|min:0',
        ]);
        
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('menu-items', 'public');
        } else if (!isset($validated['image']) || $validated['image'] === 'null' || $validated['image'] === null) {
             if (is_null($request->input('image')) || $request->input('image') === 'null') {
                 $validated['image'] = null;
             } else {
                 unset($validated['image']);
             }
        } else {
            unset($validated['image']);
        }
        
        $item->update(collect($validated)->except(['modifier_group_ids', 'variants', 'recipe_items'])->toArray());
        
        if (!empty($validated['has_variants']) && isset($validated['variants']) && is_array($validated['variants'])) {
            $item->variants()->delete();
            foreach ($validated['variants'] as $idx => $v) {
                $item->variants()->create([
                    'name' => $v['name'],
                    'price' => $v['price'],
                    'item_code' => $v['item_code'] ?? null,
                    'sort_order' => $idx,
                    'is_available' => true,
                ]);
            }
        } else if (isset($validated['has_variants']) && !$validated['has_variants']) {
            $item->variants()->delete();
        }

        if (isset($validated['modifier_group_ids'])) {
            $item->modifierGroups()->sync($validated['modifier_group_ids']);
        } else {
            $item->modifierGroups()->sync([]);
        }

        if (isset($validated['recipe_items']) && is_array($validated['recipe_items'])) {
            $item->recipeItems()->delete();
            foreach ($validated['recipe_items'] as $recipeItem) {
                $item->recipeItems()->create([
                    'ingredient_id' => $recipeItem['ingredient_id'],
                    'quantity' => $recipeItem['quantity'],
                ]);
            }
        } else if ($request->has('recipe_items')) {
            $item->recipeItems()->delete();
        }

        return back()->with('success', 'Menu Item updated.');
    }

    public function destroy(MenuItem $item)
    {
        $item->delete();
        return back()->with('success', 'Menu Item deleted.');
    }

    // Save or update Outlet Override
    public function saveOutletOverride(Request $request)
    {
        $validated = $request->validate([
            'business_location_id' => 'required|exists:business_locations,id',
            'menu_item_id' => 'required|exists:menu_items,id',
            'price' => 'nullable|numeric|min:0',
            'is_available' => 'boolean',
            'is_active' => 'boolean',
        ]);

        OutletMenuItemOverride::updateOrCreate(
            [
                'business_location_id' => $validated['business_location_id'],
                'menu_item_id' => $validated['menu_item_id'],
            ],
            [
                'price' => $validated['price'],
                'is_available' => $validated['is_available'] ?? true,
                'is_active' => $validated['is_active'] ?? true,
            ]
        );

        return back()->with('success', 'Outlet menu override saved.');
    }

    // Bulk price / status update
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:menu_categories,id',
            'action_type' => 'required|string|in:price_percentage,price_flat,toggle_active,toggle_available',
            'value' => 'required',
        ]);

        $query = MenuItem::query();
        if (!empty($validated['category_id'])) {
            $query->where('menu_category_id', $validated['category_id']);
        }

        $items = $query->get();

        foreach ($items as $item) {
            if ($validated['action_type'] === 'price_percentage') {
                $pct = (float)$validated['value'];
                $item->price = round($item->price * (1 + ($pct / 100)), 2);
                $item->save();
            } else if ($validated['action_type'] === 'price_flat') {
                $flat = (float)$validated['value'];
                $item->price = max(0, round($item->price + $flat, 2));
                $item->save();
            } else if ($validated['action_type'] === 'toggle_active') {
                $item->is_active = filter_var($validated['value'], FILTER_VALIDATE_BOOLEAN);
                $item->save();
            } else if ($validated['action_type'] === 'toggle_available') {
                $item->is_available = filter_var($validated['value'], FILTER_VALIDATE_BOOLEAN);
                $item->save();
            }
        }

        return back()->with('success', 'Bulk operation completed successfully.');
    }

    // Export Menu Master as CSV
    public function exportCsv()
    {
        $items = MenuItem::with(['category', 'subCategory', 'variants', 'kitchenStation'])->get();

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=menu_master_" . date('Y_m_d_His') . ".csv",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $columns = [
            'ID', 'Item Code', 'Item Name', 'Category', 'Sub Category', 
            'Base Price', 'Food Type', 'Spice Level', 'Tax Rate %', 
            'Tax Inclusive', 'Chef Special', 'Best Seller', 'Jain', 'Is Active', 'Is Available'
        ];

        $callback = function() use($items, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($items as $item) {
                fputcsv($file, [
                    $item->id,
                    $item->item_code ?? '',
                    $item->name,
                    $item->category ? $item->category->name : '',
                    $item->subCategory ? $item->subCategory->name : '',
                    $item->price,
                    strtoupper($item->food_type ?? 'VEG'),
                    $item->spice_level ?? 0,
                    $item->tax_rate ?? 5.0,
                    $item->is_tax_inclusive ? 'YES' : 'NO',
                    $item->is_chef_special ? 'YES' : 'NO',
                    $item->is_best_seller ? 'YES' : 'NO',
                    $item->is_jain ? 'YES' : 'NO',
                    $item->is_active ? 'YES' : 'NO',
                    $item->is_available ? 'YES' : 'NO',
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }
}

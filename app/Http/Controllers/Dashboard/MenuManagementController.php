<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\BusinessLocation;
use App\Models\Ingredient;
use App\Models\KitchenStation;
use App\Models\MenuCategory;
use App\Models\MenuCombo;
use App\Models\MenuItem;
use App\Models\ModifierGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuManagementController extends Controller
{
    public function index()
    {
        $categories = MenuCategory::with('children')->whereNull('parent_id')->orderBy('sort_order')->get();
        $allCategories = MenuCategory::orderBy('sort_order')->get();
        
        $items = MenuItem::with([
            'category', 
            'subCategory', 
            'variants', 
            'modifierGroups', 
            'recipeItems.ingredient.baseUom',
            'kitchenStation',
            'outletOverrides'
        ])->orderBy('name')->get();
        
        $modifierGroups = ModifierGroup::with('modifiers.recipeItems.ingredient.baseUom')->get();
        $ingredients = Ingredient::with(['baseUom', 'category'])->where('is_recipe_item', true)->where('status', true)->get();
        $locations = BusinessLocation::select('id', 'location_name as name')->get();
        $kitchenStations = KitchenStation::all();
        $combos = MenuCombo::with('items.menuItem')->get();
        
        return Inertia::render('menu-pos/index', [
            'categories' => $categories,
            'allCategories' => $allCategories,
            'items' => $items,
            'modifierGroups' => $modifierGroups,
            'ingredients' => $ingredients,
            'locations' => $locations,
            'kitchenStations' => $kitchenStations,
            'combos' => $combos,
        ]);
    }
}

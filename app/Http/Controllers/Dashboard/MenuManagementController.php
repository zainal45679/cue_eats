<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\ModifierGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuManagementController extends Controller
{
    public function index()
    {
        $categories = MenuCategory::orderBy('sort_order')->get();
        $items = MenuItem::with(['category', 'modifierGroups', 'recipeItems.ingredient.baseUom'])->get();
        $modifierGroups = ModifierGroup::with('modifiers.recipeItems.ingredient.baseUom')->get();
        $ingredients = \App\Models\Ingredient::with(['baseUom', 'category'])->where('is_recipe_item', true)->where('status', true)->get();
        
        return Inertia::render('menu-pos/index', [
            'categories' => $categories,
            'items' => $items,
            'modifierGroups' => $modifierGroups,
            'ingredients' => $ingredients
        ]);
    }
}

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
        $items = MenuItem::with(['category', 'modifierGroups'])->get();
        $modifierGroups = ModifierGroup::with('modifiers')->get();
        
        return Inertia::render('menu-pos/index', [
            'categories' => $categories,
            'items' => $items,
            'modifierGroups' => $modifierGroups
        ]);
    }
}

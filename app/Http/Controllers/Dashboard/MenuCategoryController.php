<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuCategoryController extends Controller
{
    public function index()
    {
        $categories = MenuCategory::orderBy('sort_order')->get();
        return Inertia::render('menu-pos/categories/index', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer'
        ]);
        
        MenuCategory::create($validated);
        return back()->with('success', 'Menu Category created.');
    }

    public function update(Request $request, MenuCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer'
        ]);
        
        $category->update($validated);
        return back()->with('success', 'Menu Category updated.');
    }

    public function destroy(MenuCategory $category)
    {
        $category->delete();
        return back()->with('success', 'Menu Category deleted.');
    }
}

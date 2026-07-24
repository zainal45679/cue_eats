<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Enums\EntityEnum;
use App\Helpers\GateHelper;
use App\Helpers\TableHelper;
use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;

final class BrandController extends Controller
{
    public function search(Request $request)
    {
        GateHelper::read(EntityEnum::Brands);

        return TableHelper::query(Brand::query())
            ->searchColumns(['name', 'manufacturer_name'])
            ->get();
    }

    public function index(Request $request)
    {
        GateHelper::read(EntityEnum::Brands);

        $data = TableHelper::query(Brand::query())
            ->searchColumns(['name', 'manufacturer_name'])
            ->get();

        return Inertia::render('supply-chain/brands/index', [
            'brands' => $data,
        ]);
    }

    public function create()
    {
        GateHelper::create(EntityEnum::Brands);

        return Inertia::render('supply-chain/brands/add');
    }

    public function store(Request $request)
    {
        GateHelper::create(EntityEnum::Brands);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'manufacturer_name' => 'nullable|string|max:255',
            'status' => 'boolean',
        ]);

        Brand::create($validated);

        return redirect()->route('brands.index')
            ->with('success', 'Brand created successfully.');
    }

    public function edit(string $uuid)
    {
        GateHelper::update(EntityEnum::Brands);

        $brand = Brand::where('uuid', $uuid)->firstOrFail();

        return Inertia::render('supply-chain/brands/edit', [
            'brand' => $brand,
        ]);
    }

    public function update(Request $request, string $uuid)
    {
        GateHelper::update(EntityEnum::Brands);

        $brand = Brand::where('uuid', $uuid)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'manufacturer_name' => 'nullable|string|max:255',
            'status' => 'boolean',
        ]);

        $brand->update($validated);

        return redirect()->route('brands.index')
            ->with('success', 'Brand updated successfully.');
    }

    public function destroy(string $uuid)
    {
        GateHelper::delete(EntityEnum::Brands);

        $brand = Brand::where('uuid', $uuid)->firstOrFail();
        
        try {
            $brand->delete();
            return redirect()->route('brands.index')
                ->with('success', 'Brand deleted successfully.');
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23000') {
                return redirect()->back()
                    ->with('error', 'Cannot delete this brand because it is used in existing ingredients or transactions.');
            }
            throw $e;
        }
    }
}

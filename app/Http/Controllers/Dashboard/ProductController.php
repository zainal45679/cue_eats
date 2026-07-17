<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Enums\EntityEnum;
use App\Helpers\GateHelper;
use App\Helpers\TableHelper;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

final class ProductController extends Controller
{
    public function index()
    {
        GateHelper::read(EntityEnum::Products);

        $productData = TableHelper::query(Product::query())
            ->searchColumns(['name', 'type'])
            ->get();

        return Inertia::render('products/index', [
            'products' => $productData,
        ]);
    }

    public function create()
    {
        return Inertia::render('products/add', []);
    }

    public function store(Request $request)
    {

        GateHelper::create(EntityEnum::Products);

        $request->validate([
            'name' => 'required|string|max:255|unique:products,name',
            'type' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'litres' => 'required|numeric|min:0',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = \App\Helpers\ImageHelper::store('products', $request->file('image'), 'image');
        }

        $data = $request->only(['name', 'type', 'category', 'litres']);
        $data['image'] = $imagePath ?: $request->input('image');
        Product::create($data);

        return redirect()->route('products.index')->with('success', 'Product created successfully!');
    }

    public function show($id)
    {
        $product = Product::findOrFail($id);

        return Inertia::render('products/show', [
            'product' => $product,

        ]);
    }

    public function edit($id)
    {

        $product = Product::findOrFail($id);

        return Inertia::render('products/edit', [
            'product' => $product,

        ]);
    }

    public function update(Request $request, string $id)
    {
        GateHelper::update(EntityEnum::Products);
        $request->validate([
            'name' => 'required|string|max:255|unique:products,name,'.$id,
            'type' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'litres' => 'required|numeric|min:0',
        ]);

        $product = Product::findOrFail($id);
        $data = $request->only(['name', 'type', 'category', 'litres']);
        if ($request->hasFile('image')) {
            if ($product->image) {
                \App\Helpers\ImageHelper::deleteOld(str_replace('/storage/', '', $product->image));
            }
            $data['image'] = \App\Helpers\ImageHelper::store('products', $request->file('image'), 'image');
        }

        $product->update($data);

        return redirect()->route('products.index')->with('success', 'Product updated successfully');
    }

    public function destroy($id)
    {
        GateHelper::delete(EntityEnum::Products);
        $product = Product::findOrFail($id);

        $product->delete();

        return redirect()->route('products.index')->with('success', 'Product deleted successfully');
    }

    public function search(Request $request)
    {
        $query = Product::query();
        if ($request->has('q') && ! empty($request->q)) {
            $query->where('name', 'like', '%'.$request->q.'%')
                ->orWhere('type', 'like', '%'.$request->q.'%');
        }
        $products = $query->limit(50)->get(['id', 'name', 'type', 'category', 'image', 'litres']);

        return response()->json($products);
    }
}

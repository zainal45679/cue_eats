<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Enums\EntityEnum;
use App\Helpers\GateHelper;
use App\Helpers\TableHelper;
use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

final class SupplierController extends Controller
{
    public function index()
    {
        GateHelper::read(EntityEnum::Suppliers);

        $data = TableHelper::query(Supplier::query())
            ->searchColumns(['name', 'contact_name', 'email', 'phone'])
            ->get();

        return Inertia::render('supply-chain/suppliers/index', [
            'suppliers' => $data,
        ]);
    }

    public function create()
    {
        GateHelper::create(EntityEnum::Suppliers);

        return Inertia::render('supply-chain/suppliers/add');
    }

    public function store(Request $request)
    {
        GateHelper::create(EntityEnum::Suppliers);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:1000',
            'tax_number' => 'nullable|string|max:255',
            'status' => 'boolean',
        ]);

        Supplier::create($validated);

        return redirect()->route('suppliers.index')
            ->with('success', 'Supplier created successfully.');
    }

    public function edit(string $uuid)
    {
        GateHelper::update(EntityEnum::Suppliers);

        $supplier = Supplier::where('uuid', $uuid)->firstOrFail();

        return Inertia::render('supply-chain/suppliers/edit', [
            'supplier' => $supplier,
        ]);
    }

    public function update(Request $request, string $uuid)
    {
        GateHelper::update(EntityEnum::Suppliers);

        $supplier = Supplier::where('uuid', $uuid)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:1000',
            'tax_number' => 'nullable|string|max:255',
            'status' => 'boolean',
        ]);

        $supplier->update($validated);

        return redirect()->route('suppliers.index')
            ->with('success', 'Supplier updated successfully.');
    }

    public function destroy(string $uuid)
    {
        GateHelper::delete(EntityEnum::Suppliers);

        $supplier = Supplier::where('uuid', $uuid)->firstOrFail();
        $supplier->delete();

        return redirect()->route('suppliers.index')
            ->with('success', 'Supplier deleted successfully.');
    }

    public function search(Request $request)
    {
        $query = Supplier::where('status', true);

        if ($request->has('q') && ! empty($request->q)) {
            $query->where('name', 'like', '%' . $request->q . '%');
        }

        return response()->json($query->limit(50)->get(['id', 'name']));
    }
}

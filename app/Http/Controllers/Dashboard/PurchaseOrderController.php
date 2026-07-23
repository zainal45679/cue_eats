<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PurchaseOrder;

class PurchaseOrderController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', PurchaseOrder::class);
        
        $query = PurchaseOrder::with(['supplier', 'businessLocation', 'deliveryLocation']);

        if (!auth()->user()->hasRole('admin')) {
            $query->where('business_location_id', auth()->user()->business_location_id);
        }

        $query->latest();

        return Inertia::render('purchasing/purchase-orders/index', [
            'purchaseOrders' => \App\Helpers\TableHelper::query($query)
                ->searchColumns(['po_number'])
                ->transform(fn ($po): array => $po->toArray())
                ->get(),
        ]);
    }

    public function create()
    {
        $this->authorize('create', PurchaseOrder::class);

        $businessLocationsQuery = \App\Models\BusinessLocation::query();
        if (!auth()->user()->hasRole('admin')) {
            $businessLocationsQuery->where('id', auth()->user()->business_location_id);
        }

        return Inertia::render('purchasing/purchase-orders/create', [
            'suppliers' => \App\Models\Supplier::all(),
            'businessLocations' => $businessLocationsQuery->get(),
            'ingredients' => \App\Models\Ingredient::with('category')->get(),
            'supplierIngredients' => \App\Models\IngredientSupplier::with('ingredient')->get(),
            'categories' => \App\Models\IngredientCategory::all(),
        ]);
    }

    public function store(\Illuminate\Http\Request $request)
    {
        $this->authorize('create', PurchaseOrder::class);
        // Custom validation logic depending on the mode
        $data = $request->validate([
            'mode' => 'required|in:supplier,category',
            'supplier_id' => 'required_if:mode,supplier',
            'delivery_location_id' => 'required|exists:business_locations,id',
            'expected_delivery_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.ingredient_id' => 'required|exists:ingredients,id',
            'items.*.supplier_id' => 'required_if:mode,category',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($data) {
            $items = \Illuminate\Support\Arr::pull($data, 'items');
            $mode = \Illuminate\Support\Arr::pull($data, 'mode');
            
            $data['created_by'] = auth()->id();
            $data['status'] = 'draft';
            
            // Set business_location_id for multi-tenant scope
            // Assuming the branch ordering is also the delivery location
            $data['business_location_id'] = $data['delivery_location_id'];

            if ($mode === 'category') {
                // Group items by supplier_id
                $groupedItems = collect($items)->groupBy('supplier_id');
                
                foreach ($groupedItems as $supplierId => $supplierItems) {
                    $poData = $data;
                    $poData['supplier_id'] = $supplierId;
                    $poData['po_number'] = 'PO-' . time() . '-' . $supplierId;
                    
                    // Calculate total for this specific PO
                    $poData['grand_total'] = $supplierItems->sum(function ($item) {
                        return $item['quantity'] * $item['unit_price'];
                    });

                    $po = PurchaseOrder::create($poData);

                    foreach ($supplierItems as $item) {
                        $supplierIngredient = \App\Models\IngredientSupplier::where('ingredient_id', $item['ingredient_id'])
                            ->where('supplier_id', $supplierId)
                            ->first();

                        if ($supplierIngredient) {
                            $item['purchase_uom_id'] = $supplierIngredient->purchase_uom_id;
                        } else {
                            $ingredient = \App\Models\Ingredient::find($item['ingredient_id']);
                            $item['purchase_uom_id'] = $ingredient->base_uom_id;
                        }
                        
                        \Illuminate\Support\Arr::pull($item, 'supplier_id');
                        \Illuminate\Support\Arr::pull($item, 'category_id');
                        
                        $po->items()->create($item);
                    }
                }
            } else {
                // Supplier mode (Single PO)
                $data['po_number'] = 'PO-' . time();
                $data['grand_total'] = collect($items)->sum(function ($item) {
                    return $item['quantity'] * $item['unit_price'];
                });

                $po = PurchaseOrder::create($data);

                foreach ($items as $item) {
                    $supplierIngredient = \App\Models\IngredientSupplier::where('ingredient_id', $item['ingredient_id'])
                        ->where('supplier_id', $data['supplier_id'])
                        ->first();

                    if ($supplierIngredient) {
                        $item['purchase_uom_id'] = $supplierIngredient->purchase_uom_id;
                    } else {
                        $ingredient = \App\Models\Ingredient::find($item['ingredient_id']);
                        $item['purchase_uom_id'] = $ingredient->base_uom_id;
                    }

                    \Illuminate\Support\Arr::pull($item, 'supplier_id');
                    \Illuminate\Support\Arr::pull($item, 'category_id');

                    $po->items()->create($item);
                }
            }
        });

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order(s) created.');
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $this->authorize('view', $purchaseOrder);
        
        $purchaseOrder->load(['items.ingredient', 'items.unitOfMeasure', 'supplier', 'deliveryLocation', 'businessLocation', 'approvals.approver']);
        
        return Inertia::render('purchasing/purchase-orders/show', [
            'purchaseOrder' => $purchaseOrder,
            'canApprove' => auth()->user()->can('approve', $purchaseOrder),
        ]);
    }

    public function edit(PurchaseOrder $purchaseOrder)
    {
        $this->authorize('update', $purchaseOrder);

        $purchaseOrder->load('items.ingredient');

        $businessLocationsQuery = \App\Models\BusinessLocation::query();
        if (!auth()->user()->hasRole('admin')) {
            $businessLocationsQuery->where('id', auth()->user()->business_location_id);
        }

        return Inertia::render('purchasing/purchase-orders/edit', [
            'purchaseOrder' => $purchaseOrder,
            'suppliers' => \App\Models\Supplier::all(),
            'businessLocations' => $businessLocationsQuery->get(),
            'ingredients' => \App\Models\Ingredient::with('category')->get(),
            'supplierIngredients' => \App\Models\IngredientSupplier::with('ingredient')->get(),
            'categories' => \App\Models\IngredientCategory::all(),
        ]);
    }

    public function approve(PurchaseOrder $purchaseOrder)
    {
        $this->authorize('approve', $purchaseOrder);

        $purchaseOrder->update(['status' => 'approved']);

        // Log approval (assuming an approvals table exists)
        if (\Illuminate\Support\Facades\Schema::hasTable('purchase_order_approvals')) {
            $purchaseOrder->approvals()->create([
                'approver_id' => auth()->id(),
                'status' => 'approved',
                'comments' => request('notes'),
                'acted_at' => now(),
            ]);
        }

        return redirect()->back()->with('success', 'Purchase Order approved successfully.');
    }

    public function reject(PurchaseOrder $purchaseOrder)
    {
        $this->authorize('reject', $purchaseOrder);

        $purchaseOrder->update(['status' => 'rejected']);

        if (\Illuminate\Support\Facades\Schema::hasTable('purchase_order_approvals')) {
            $purchaseOrder->approvals()->create([
                'approver_id' => auth()->id(),
                'status' => 'rejected',
                'comments' => request('notes'),
                'acted_at' => now(),
            ]);
        }

        return redirect()->back()->with('success', 'Purchase Order rejected.');
    }

    public function update(\App\Http\Requests\UpdatePurchaseOrderRequest $request, PurchaseOrder $purchaseOrder)
    {
        \Illuminate\Support\Facades\DB::transaction(function () use ($request, $purchaseOrder) {
            $data = $request->validated();
            $items = \Illuminate\Support\Arr::pull($data, 'items');
            \Illuminate\Support\Arr::pull($data, 'mode'); // Mode is not stored in DB
            
            $data['updated_by'] = auth()->id();
            
            if (isset($data['delivery_location_id'])) {
                $data['business_location_id'] = $data['delivery_location_id'];
            }

            // Recalculate total
            $total = collect($items)->sum(fn ($item) => $item['quantity'] * $item['unit_price']);
            $data['grand_total'] = $total;
            
            $purchaseOrder->update($data);

            // Recreate items for simplicity
            $purchaseOrder->items()->delete();
            
            foreach ($items as $item) {
                $supplierIngredient = \App\Models\IngredientSupplier::where('ingredient_id', $item['ingredient_id'])
                    ->where('supplier_id', $data['supplier_id'])
                    ->first();

                if ($supplierIngredient) {
                    $item['purchase_uom_id'] = $supplierIngredient->purchase_uom_id;
                } else {
                    $ingredient = \App\Models\Ingredient::find($item['ingredient_id']);
                    $item['purchase_uom_id'] = $ingredient->base_uom_id;
                }

                \Illuminate\Support\Arr::pull($item, 'supplier_id');
                \Illuminate\Support\Arr::pull($item, 'category_id');

                $purchaseOrder->items()->create($item);
            }
        });

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order updated.');
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->delete();
        return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order deleted.');
    }
}

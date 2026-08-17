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
        
        $query = PurchaseOrder::with(['supplier' => fn($q) => $q->withTrashed(), 'businessLocation', 'deliveryLocation', 'createdBy', 'grns.receivedBy']);

        $activeLocationId = session('active_location_id');
        if (!auth()->user()->hasRole('admin') || $activeLocationId) {
            $locationId = !auth()->user()->hasRole('admin') ? auth()->user()->business_location_id : $activeLocationId;
            $query->where('business_location_id', $locationId);
        }

        $type = request('type');
        if ($type === 'incoming') {
            $query->whereIn('status', ['approved', 'partially_received']);
        }

        $query->latest();

        return Inertia::render('purchasing/purchase-orders/index', [
            'purchaseOrders' => \App\Helpers\TableHelper::query($query)
                ->searchColumns(['po_number'])
                ->transform(fn ($po): array => $po->toArray())
                ->get(),
            'type' => $type,
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
            'ingredients' => \App\Models\Ingredient::with(['category', 'baseUom'])->get(),
            'supplierIngredients' => \App\Models\IngredientSupplier::with(['ingredient', 'purchaseUom'])->get(),
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
            $data['status'] = 'pending_approval';
            
            // Set business_location_id for multi-tenant scope
            // Assuming the branch ordering is also the delivery location
            $deliveryLocId = auth()->user()->hasRole('admin') ? $data['delivery_location_id'] : auth()->user()->business_location_id;
            $data['delivery_location_id'] = $deliveryLocId;
            $data['business_location_id'] = $deliveryLocId;

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
        
        $purchaseOrder->load(['items.ingredient' => fn($q) => $q->withTrashed(), 'items.unitOfMeasure', 'supplier' => fn($q) => $q->withTrashed(), 'businessLocation', 'deliveryLocation', 'approvals.approver', 'createdBy']);
        
        return Inertia::render('purchasing/purchase-orders/show', [
            'purchaseOrder' => $purchaseOrder,
            'canApprove' => auth()->user()->hasRole('admin') || auth()->user()->hasPermissionTo('approve.purchase-orders'),
            'workflow' => request('workflow', 'manage'),
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
            'ingredients' => \App\Models\Ingredient::with(['category', 'baseUom'])->get(),
            'supplierIngredients' => \App\Models\IngredientSupplier::with(['ingredient', 'purchaseUom'])->get(),
            'categories' => \App\Models\IngredientCategory::all(),
        ]);
    }

    public function submit(PurchaseOrder $purchaseOrder)
    {
        $this->authorize('update', $purchaseOrder);

        if ($purchaseOrder->status !== 'draft') {
            abort(400, 'Only draft Purchase Orders can be submitted for approval.');
        }

        $purchaseOrder->update(['status' => 'pending_approval']);

        return redirect()->back()->with('success', 'Purchase Order submitted for approval.');
    }

    public function approvalForm(PurchaseOrder $purchaseOrder)
    {
        $this->authorize('approve', $purchaseOrder);

        if ($purchaseOrder->status !== 'draft' && $purchaseOrder->status !== 'pending_approval') {
            abort(400, 'This Purchase Order cannot be approved in its current state.');
        }

        $purchaseOrder->load(['items.ingredient' => fn($q) => $q->withTrashed(), 'items.unitOfMeasure', 'supplier' => fn($q) => $q->withTrashed(), 'businessLocation', 'deliveryLocation', 'createdBy']);

        return Inertia::render('purchasing/purchase-orders/approve', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }

    public function approve(\Illuminate\Http\Request $request, PurchaseOrder $purchaseOrder)
    {
        \Illuminate\Support\Facades\Log::info('Approve method hit for PO: ' . $purchaseOrder->uuid);
        $this->authorize('approve', $purchaseOrder);

        if ($purchaseOrder->status !== 'draft' && $purchaseOrder->status !== 'pending_approval') {
            abort(400, 'This Purchase Order cannot be approved in its current state.');
        }

        $data = $request->validate([
            'notes' => 'nullable|string',
            'items' => 'required|array',
            'items.*.id' => 'required|exists:purchase_order_items,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($purchaseOrder, $data) {
            $grandTotal = 0;
            
            // Update items
            foreach ($data['items'] as $itemData) {
                $poItem = $purchaseOrder->items()->find($itemData['id']);
                if ($poItem) {
                    $poItem->update([
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                    ]);
                    $grandTotal += ($itemData['quantity'] * $itemData['unit_price']);
                }
            }

            $purchaseOrder->update([
                'status' => 'approved',
                'grand_total' => $grandTotal,
            ]);

            // Log approval (assuming an approvals table exists)
            if (\Illuminate\Support\Facades\Schema::hasTable('purchase_order_approvals')) {
                $purchaseOrder->approvals()->create([
                    'approver_id' => auth()->id(),
                    'status' => 'approved',
                    'comments' => $data['notes'] ?? null,
                    'acted_at' => now(),
                ]);
            }

            // Track items as on-order in the delivery location's inventory
            $targetLocationId = (!empty($purchaseOrder->delivery_location_id) && \Illuminate\Support\Str::isUuid((string)$purchaseOrder->delivery_location_id) && \App\Models\BusinessLocation::where('id', $purchaseOrder->delivery_location_id)->exists())
                ? (string)$purchaseOrder->delivery_location_id
                : ((!empty($purchaseOrder->business_location_id) && \Illuminate\Support\Str::isUuid((string)$purchaseOrder->business_location_id) && \App\Models\BusinessLocation::where('id', $purchaseOrder->business_location_id)->exists())
                    ? (string)$purchaseOrder->business_location_id
                    : \App\Models\BusinessLocation::first()?->id);

            foreach ($purchaseOrder->items()->get() as $item) {
                $storageLocation = \App\Models\StorageLocation::firstOrCreate(
                    [
                        'business_location_id' => $targetLocationId,
                        'storage_name' => 'Main Store',
                    ],
                    [
                        'storage_type' => 'Store',
                        'status' => 1,
                    ]
                );

                $balance = \App\Models\InventoryBalance::firstOrCreate(
                    [
                        'storage_location_id' => $storageLocation->id,
                        'ingredient_id' => $item->ingredient_id,
                    ],
                    ['available_qty' => 0, 'reserved_qty' => 0, 'on_order_qty' => 0]
                );

                $balance->increment('on_order_qty', $item->quantity);
            }
        });

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order approved successfully.');
    }

    public function reject(PurchaseOrder $purchaseOrder)
    {
        $this->authorize('reject', $purchaseOrder);

        if ($purchaseOrder->status !== 'draft' && $purchaseOrder->status !== 'pending_approval') {
            abort(400, 'This Purchase Order cannot be rejected in its current state.');
        }

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
        $this->authorize('update', $purchaseOrder);
        
        if (!in_array($purchaseOrder->status, ['draft', 'pending_approval'])) {
            abort(403, 'Only draft or pending purchase orders can be updated.');
        }

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
        $this->authorize('delete', $purchaseOrder);
        
        if (!in_array($purchaseOrder->status, ['draft', 'pending_approval'])) {
            abort(403, 'Only draft or pending purchase orders can be deleted.');
        }

        $purchaseOrder->delete();
        return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order deleted.');
    }
}

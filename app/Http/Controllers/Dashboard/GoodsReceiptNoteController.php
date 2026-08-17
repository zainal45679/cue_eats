<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\GoodsReceiptNote;
use App\Models\StockTransferOrder;
use App\Models\InventoryBalance;
use App\Models\InventoryLedger;
use Illuminate\Support\Facades\DB;

class GoodsReceiptNoteController extends Controller
{
    public function index()
    {
        $query = GoodsReceiptNote::with(['location', 'receivedBy', 'stockTransferOrder.internalRequest.requestedBy', 'purchaseOrder.createdBy', 'items']);
        
        $activeLocationId = session('active_location_id');
        if (!auth()->user()->hasRole('admin') || $activeLocationId) {
            $locationId = !auth()->user()->hasRole('admin') ? auth()->user()->business_location_id : $activeLocationId;
            $query->where('location_id', $locationId);
        }
        
        $query->latest();
            
        return Inertia::render('purchasing/grns/index', [
            'grns' => \App\Helpers\TableHelper::query($query)
                ->searchColumns(['grn_number'])
                ->addCustomFilter('source_type', function ($q, $value) {
                    if ($value === 'internal') {
                        $q->whereNotNull('stock_transfer_order_id');
                    } elseif ($value === 'external') {
                        $q->whereNotNull('purchase_order_id');
                    }
                })
                ->transform(fn ($grn): array => $grn->toArray())
                ->get(),
        ]);
    }

    public function create(Request $request)
    {
        $stoId = $request->query('sto_id');
        $poId = $request->query('po_id');
        
        if ($stoId) {
            $sto = StockTransferOrder::with('items.ingredient', 'items.unitOfMeasure', 'fromLocation', 'toLocation')->findOrFail($stoId);
            
            $canReceive = auth()->user()->hasRole('admin') || auth()->user()->business_location_id === $sto->to_location_id;
            if (!$canReceive) {
                abort(403, 'You are not authorized to receive items for this location.');
            }

            return Inertia::render('purchasing/grns/create', [
                'sto' => $sto,
            ]);
        }
        
        if ($poId) {
            $po = \App\Models\PurchaseOrder::with('items.ingredient', 'items.unitOfMeasure', 'supplier', 'deliveryLocation')->findOrFail($poId);
            
            $canReceive = auth()->user()->hasRole('admin') || auth()->user()->business_location_id === $po->delivery_location_id;
            if (!$canReceive) {
                abort(403, 'You are not authorized to receive items for this location.');
            }
            
            return Inertia::render('purchasing/grns/create', [
                'po' => $po,
            ]);
        }
        
        abort(404, 'Source document not specified.');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'sto_id' => 'nullable|exists:stock_transfer_orders,id',
            'po_id' => 'nullable|exists:purchase_orders,id',
            'remarks' => 'nullable|string',
            'items' => 'required|array',
            'items.*.ingredient_id' => 'required|exists:ingredients,id',
            'items.*.expected_quantity' => 'required|numeric',
            'items.*.received_quantity' => 'required|numeric|min:0',
            'items.*.rejected_quantity' => 'required|numeric|min:0',
            'items.*.uom_id' => 'required|exists:units_of_measure,id',
        ]);
        
        foreach ($data['items'] as $item) {
            if (($item['received_quantity'] + $item['rejected_quantity']) > $item['expected_quantity']) {
                abort(422, 'Total processed quantity cannot exceed expected quantity.');
            }
        }

        if (!empty($data['po_id'])) {
            return $this->storePoGrn($data);
        }

        if (!empty($data['sto_id'])) {
            return $this->storeStoGrn($data);
        }
        
        abort(400, 'Source document missing.');
    }

    private function resolveLocationUuid(...$candidates): string
    {
        foreach ($candidates as $id) {
            if (!empty($id) && \Illuminate\Support\Str::isUuid((string)$id) && \App\Models\BusinessLocation::where('id', (string)$id)->exists()) {
                return (string)$id;
            }
        }
        return \App\Models\BusinessLocation::first()?->id ?? '';
    }

    private function storeStoGrn($data)
    {
        $sto = StockTransferOrder::findOrFail($data['sto_id']);
        
        $targetLocationId = $this->resolveLocationUuid($sto->to_location_id, $sto->from_location_id);

        $canReceive = auth()->user()->hasRole('admin') || auth()->user()->business_location_id === $targetLocationId;
        if (!$canReceive) {
            abort(403, 'You are not authorized to receive items for this location.');
        }

        DB::transaction(function () use ($data, $sto, $targetLocationId) {
            $stoLocked = StockTransferOrder::where('id', $sto->id)->lockForUpdate()->first();
            if (!in_array($stoLocked->status, ['dispatched', 'partially_received'])) {
                abort(403, 'STO must be dispatched before receiving.');
            }

            $nextId = \App\Models\GoodsReceiptNote::count() + 1;
            while (\App\Models\GoodsReceiptNote::where('grn_number', 'GRN-' . $nextId)->exists()) {
                $nextId++;
            }

            $grn = GoodsReceiptNote::create([
                'stock_transfer_order_id' => $stoLocked->id,
                'grn_number' => 'GRN-' . $nextId,
                'location_id' => $targetLocationId,
                'received_by_id' => auth()->id(),
                'status' => 'completed',
                'remarks' => $data['remarks'] ?? null,
            ]);

            foreach ($data['items'] as $itemData) {
                $grn->items()->create([
                    'ingredient_id' => $itemData['ingredient_id'],
                    'expected_quantity' => $itemData['expected_quantity'],
                    'received_quantity' => $itemData['received_quantity'],
                    'rejected_quantity' => $itemData['rejected_quantity'],
                    'uom_id' => $itemData['uom_id'],
                ]);

                $uom = \App\Models\UnitOfMeasure::find($itemData['uom_id']);
                $conversionFactor = $uom && $uom->conversion_factor ? (float)$uom->conversion_factor : 1;
                $convertedReceivedQty = $itemData['received_quantity'] * $conversionFactor;
                $convertedRejectedQty = $itemData['rejected_quantity'] * $conversionFactor;

                $stoItem = $stoLocked->items()->where('ingredient_id', $itemData['ingredient_id'])->first();
                if ($stoItem) {
                    $stoItem->increment('received_quantity', $itemData['received_quantity']);
                    $stoItem->increment('rejected_quantity', $itemData['rejected_quantity']);
                }

                if ($convertedReceivedQty > 0) {
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

                    $balance = InventoryBalance::firstOrCreate(
                        [
                            'storage_location_id' => $storageLocation->id,
                            'ingredient_id' => $itemData['ingredient_id'],
                        ],
                        ['available_qty' => 0]
                    );
                    
                    $balance->increment('available_qty', $convertedReceivedQty);

                    InventoryLedger::create([
                        'business_location_id' => $targetLocationId,
                        'ingredient_id' => $itemData['ingredient_id'],
                        'transaction_type' => 'transfer_in',
                        'reference_type' => GoodsReceiptNote::class,
                        'reference_id' => $grn->id,
                        'quantity' => $convertedReceivedQty,
                        'running_balance' => $balance->fresh()->available_qty,
                        'created_by' => auth()->id(),
                    ]);
                }
            }

            $allItemsFullyProcessed = true;
            $totalReceived = 0;
            $totalRejected = 0;
            
            foreach ($stoLocked->items as $stoItem) {
                if (($stoItem->received_quantity + $stoItem->rejected_quantity) < $stoItem->dispatched_quantity) {
                    $allItemsFullyProcessed = false;
                }
                $totalReceived += $stoItem->received_quantity;
                $totalRejected += $stoItem->rejected_quantity;
            }

            if ($allItemsFullyProcessed) {
                if ($totalReceived == 0 && $totalRejected > 0) {
                    $stoLocked->update(['status' => 'cancelled']);
                } else {
                    $stoLocked->update(['status' => 'received']);
                }
            } else {
                $stoLocked->update(['status' => 'partially_received']);
            }
        });

        return redirect()->route('grns.index')->with('success', 'Received Goods recorded successfully.');
    }

    private function storePoGrn($data)
    {
        $po = \App\Models\PurchaseOrder::findOrFail($data['po_id']);
        
        $targetLocationId = $this->resolveLocationUuid($po->delivery_location_id, $po->business_location_id);

        $canReceive = auth()->user()->hasRole('admin') || auth()->user()->business_location_id === $targetLocationId;
        if (!$canReceive) {
            abort(403, 'You are not authorized to receive items for this location.');
        }

        DB::transaction(function () use ($data, $po, $targetLocationId) {
            $poLocked = \App\Models\PurchaseOrder::where('id', $po->id)->lockForUpdate()->first();
            if (!in_array($poLocked->status, ['approved', 'partially_received'])) {
                abort(403, 'PO must be approved before receiving.');
            }

            $nextId = \App\Models\GoodsReceiptNote::count() + 1;
            while (\App\Models\GoodsReceiptNote::where('grn_number', 'GRN-' . $nextId)->exists()) {
                $nextId++;
            }

            $grn = GoodsReceiptNote::create([
                'purchase_order_id' => $poLocked->id,
                'grn_number' => 'GRN-' . $nextId,
                'location_id' => $targetLocationId,
                'received_by_id' => auth()->id(),
                'status' => 'completed',
                'remarks' => $data['remarks'] ?? null,
            ]);

            foreach ($data['items'] as $itemData) {
                $grn->items()->create([
                    'ingredient_id' => $itemData['ingredient_id'],
                    'expected_quantity' => $itemData['expected_quantity'],
                    'received_quantity' => $itemData['received_quantity'],
                    'rejected_quantity' => $itemData['rejected_quantity'],
                    'uom_id' => $itemData['uom_id'],
                ]);

                $uom = \App\Models\UnitOfMeasure::find($itemData['uom_id']);
                $conversionFactor = $uom && $uom->conversion_factor ? (float)$uom->conversion_factor : 1;
                $convertedReceivedQty = $itemData['received_quantity'] * $conversionFactor;
                $convertedRejectedQty = $itemData['rejected_quantity'] * $conversionFactor;

                // Update PO Item received quantity
                $poItem = $poLocked->items()->where('ingredient_id', $itemData['ingredient_id'])->first();
                if ($poItem) {
                    $poItem->increment('received_quantity', $itemData['received_quantity']);
                    $poItem->increment('rejected_quantity', $itemData['rejected_quantity']);
                    
                    // Update supplier price tracking
                    $supplierIngredient = \App\Models\IngredientSupplier::where('ingredient_id', $itemData['ingredient_id'])
                        ->where('supplier_id', $poLocked->supplier_id)
                        ->first();
                    
                    if ($supplierIngredient) {
                        $supplierIngredient->update(['price' => $poItem->unit_price]);
                    }
                }

                if ($convertedReceivedQty > 0 || $convertedRejectedQty > 0) {
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

                    $balance = InventoryBalance::firstOrCreate(
                        [
                            'storage_location_id' => $storageLocation->id,
                            'ingredient_id' => $itemData['ingredient_id'],
                        ],
                        ['available_qty' => 0, 'reserved_qty' => 0, 'on_order_qty' => 0]
                    );
                    
                    // Deduct from on-order qty safely
                    $processedQty = $convertedReceivedQty + $convertedRejectedQty;
                    $decrementAmount = min($balance->on_order_qty, $processedQty);
                    if ($decrementAmount > 0) {
                        $balance->decrement('on_order_qty', $decrementAmount);
                    }

                    // Add to available qty if received
                    if ($convertedReceivedQty > 0) {
                        $balance->increment('available_qty', $convertedReceivedQty);

                        InventoryLedger::create([
                            'business_location_id' => $targetLocationId,
                            'ingredient_id' => $itemData['ingredient_id'],
                            'transaction_type' => 'purchase',
                            'reference_type' => GoodsReceiptNote::class,
                            'reference_id' => $grn->id,
                            'quantity' => $convertedReceivedQty,
                            'running_balance' => $balance->fresh()->available_qty,
                            'created_by' => auth()->id(),
                        ]);
                    }
                }
            }

            // Refresh the items relation to get the updated quantities from the database
            $poLocked->load('items');

            $isFullyReceived = true;
            foreach ($poLocked->items as $item) {
                if ($item->received_quantity + $item->rejected_quantity < $item->quantity) {
                    $isFullyReceived = false;
                    break;
                }
            }

            $poLocked->update(['status' => $isFullyReceived ? 'received' : 'partially_received']);
        });

        return redirect()->route('grns.index')->with('success', 'Purchase Order GRN created successfully.');
    }

    public function show(GoodsReceiptNote $goodsReceiptNote)
    {
        $goodsReceiptNote->load(['items.ingredient' => fn($q) => $q->withTrashed(), 'items.unitOfMeasure', 'location', 'receivedBy', 'stockTransferOrder.fromLocation', 'purchaseOrder.supplier' => fn($q) => $q->withTrashed()]);
        
        return Inertia::render('purchasing/grns/show', [
            'grn' => $goodsReceiptNote,
        ]);
    }
}

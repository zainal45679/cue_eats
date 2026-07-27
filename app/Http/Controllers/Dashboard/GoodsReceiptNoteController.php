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
        $query = GoodsReceiptNote::with(['location', 'receivedBy', 'stockTransferOrder.internalRequest.requestedBy', 'purchaseOrder.createdBy']);
        
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

    private function storeStoGrn($data)
    {
        $sto = StockTransferOrder::findOrFail($data['sto_id']);
        
        $canReceive = auth()->user()->hasRole('admin') || auth()->user()->business_location_id === $sto->to_location_id;
        if (!$canReceive) {
            abort(403, 'You are not authorized to receive items for this location.');
        }

        DB::transaction(function () use ($data, $sto) {
            $stoLocked = StockTransferOrder::where('id', $sto->id)->lockForUpdate()->first();
            if (!in_array($stoLocked->status, ['dispatched', 'partially_received'])) {
                abort(403, 'STO must be dispatched before receiving.');
            }

            $grn = GoodsReceiptNote::create([
                'stock_transfer_order_id' => $stoLocked->id,
                'grn_number' => 'GRN-' . time(),
                'location_id' => $sto->to_location_id,
                'received_by_id' => auth()->id(),
                'status' => 'submitted',
                'remarks' => $data['remarks'] ?? null,
            ]);

            $allReceived = true;
            $allRejected = true;

            foreach ($data['items'] as $itemData) {
                $grn->items()->create([
                    'ingredient_id' => $itemData['ingredient_id'],
                    'expected_quantity' => $itemData['expected_quantity'],
                    'received_quantity' => $itemData['received_quantity'],
                    'rejected_quantity' => $itemData['rejected_quantity'],
                    'uom_id' => $itemData['uom_id'],
                ]);

                if ($itemData['received_quantity'] > 0) {
                    $allRejected = false;
                    
                    $storageLocation = \App\Models\StorageLocation::firstOrCreate(
                        [
                            'business_location_id' => $grn->location_id,
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
                    
                    $balance->increment('available_qty', $itemData['received_quantity']);

                    InventoryLedger::create([
                        'business_location_id' => $stoLocked->to_location_id,
                        'ingredient_id' => $itemData['ingredient_id'],
                        'transaction_type' => 'transfer_in',
                        'reference_type' => GoodsReceiptNote::class,
                        'reference_id' => $grn->id,
                        'quantity' => $itemData['received_quantity'],
                        'running_balance' => $balance->fresh()->available_qty,
                        'created_by' => auth()->id(),
                    ]);
                } else {
                    $allReceived = false;
                }
            }

            if ($allRejected && !$allReceived) {
                $stoLocked->update(['status' => 'cancelled']);
            } elseif (!$allReceived && !$allRejected) {
                $stoLocked->update(['status' => 'partially_received']);
            } else {
                $stoLocked->update(['status' => 'received']);
            }
            
            if ($stoLocked->internalRequest) {
                $stoLocked->internalRequest->update(['status' => 'received']);
            }
        });

        return redirect()->route('grns.index')->with('success', 'Received Goods recorded successfully.');
    }

    private function storePoGrn($data)
    {
        $po = \App\Models\PurchaseOrder::findOrFail($data['po_id']);
        
        $canReceive = auth()->user()->hasRole('admin') || auth()->user()->business_location_id === $po->delivery_location_id;
        if (!$canReceive) {
            abort(403, 'You are not authorized to receive items for this location.');
        }

        DB::transaction(function () use ($data, $po) {
            $poLocked = \App\Models\PurchaseOrder::where('id', $po->id)->lockForUpdate()->first();
            if (!in_array($poLocked->status, ['approved', 'partially_received'])) {
                abort(403, 'PO must be approved before receiving.');
            }

            $grn = GoodsReceiptNote::create([
                'purchase_order_id' => $poLocked->id,
                'grn_number' => 'GRN-' . time(),
                'location_id' => $po->delivery_location_id,
                'received_by_id' => auth()->id(),
                'status' => 'submitted',
                'remarks' => $data['remarks'] ?? null,
            ]);

            $allItemsFullyReceived = true;

            foreach ($data['items'] as $itemData) {
                $grn->items()->create([
                    'ingredient_id' => $itemData['ingredient_id'],
                    'expected_quantity' => $itemData['expected_quantity'],
                    'received_quantity' => $itemData['received_quantity'],
                    'rejected_quantity' => $itemData['rejected_quantity'],
                    'uom_id' => $itemData['uom_id'],
                ]);

                // Update PO Item received quantity
                $poItem = $poLocked->items()->where('ingredient_id', $itemData['ingredient_id'])->first();
                if ($poItem) {
                    $poItem->increment('received_quantity', $itemData['received_quantity']);
                    
                    if ($poItem->fresh()->received_quantity < $poItem->quantity) {
                        $allItemsFullyReceived = false;
                    }
                    
                    // Update supplier price tracking
                    $supplierIngredient = \App\Models\IngredientSupplier::where('ingredient_id', $itemData['ingredient_id'])
                        ->where('supplier_id', $poLocked->supplier_id)
                        ->first();
                    
                    if ($supplierIngredient) {
                        $supplierIngredient->update(['price' => $poItem->unit_price]);
                    }
                }

                if ($itemData['received_quantity'] > 0 || $itemData['rejected_quantity'] > 0) {
                    $storageLocation = \App\Models\StorageLocation::firstOrCreate(
                        [
                            'business_location_id' => $grn->location_id,
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
                    $processedQty = $itemData['received_quantity'] + $itemData['rejected_quantity'];
                    $decrementAmount = min($balance->on_order_qty, $processedQty);
                    if ($decrementAmount > 0) {
                        $balance->decrement('on_order_qty', $decrementAmount);
                    }

                    // Add to available qty if received
                    if ($itemData['received_quantity'] > 0) {
                        $balance->increment('available_qty', $itemData['received_quantity']);

                        InventoryLedger::create([
                            'business_location_id' => $poLocked->delivery_location_id,
                            'ingredient_id' => $itemData['ingredient_id'],
                            'transaction_type' => 'purchase',
                            'reference_type' => GoodsReceiptNote::class,
                            'reference_id' => $grn->id,
                            'quantity' => $itemData['received_quantity'],
                            'running_balance' => $balance->fresh()->available_qty,
                            'created_by' => auth()->id(),
                        ]);
                    }
                }
            }

            if ($allItemsFullyReceived) {
                $poLocked->update(['status' => 'received']);
            } else {
                $poLocked->update(['status' => 'partially_received']);
            }
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

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
        $query = GoodsReceiptNote::with(['location', 'receivedBy', 'stockTransferOrder']);
        
        if (!auth()->user()->hasRole('admin')) {
            $query->where('location_id', auth()->user()->business_location_id);
        }
        
        $query->latest();
            
        return Inertia::render('purchasing/grns/index', [
            'grns' => \App\Helpers\TableHelper::query($query)
                ->searchColumns(['grn_number'])
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
        
        // Handling for PO can be added later
        abort(404, 'Source document not specified.');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'sto_id' => 'required|exists:stock_transfer_orders,id',
            'remarks' => 'nullable|string',
            'items' => 'required|array',
            'items.*.ingredient_id' => 'required|exists:ingredients,id',
            'items.*.expected_quantity' => 'required|numeric',
            'items.*.received_quantity' => 'required|numeric|min:0',
            'items.*.rejected_quantity' => 'required|numeric|min:0',
            'items.*.uom_id' => 'required|exists:units_of_measure,id',
        ]);

        $sto = StockTransferOrder::findOrFail($data['sto_id']);
        
        $canReceive = auth()->user()->hasRole('admin') || auth()->user()->business_location_id === $sto->to_location_id;
        if (!$canReceive) {
            abort(403, 'You are not authorized to receive items for this location.');
        }

        DB::transaction(function () use ($data, $sto) {
            
            $grn = GoodsReceiptNote::create([
                'stock_transfer_order_id' => $sto->id,
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
                    
                    // Find a default storage location for the business location
                    $storageLocation = \App\Models\StorageLocation::firstOrCreate(
                        [
                            'business_location_id' => $sto->to_location_id,
                            'default_receiving_location' => true,
                        ],
                        [
                            'storage_name' => 'Main Store',
                            'storage_type' => 'Store',
                            'status' => 1,
                        ]
                    );

                    // 1. Add to InventoryBalance
                    $balance = InventoryBalance::firstOrCreate(
                        [
                            'storage_location_id' => $storageLocation->id,
                            'ingredient_id' => $itemData['ingredient_id'],
                        ],
                        ['available_qty' => 0]
                    );
                    
                    $balance->increment('available_qty', $itemData['received_quantity']);

                    // 2. Insert into InventoryLedger (transfer_in)
                    InventoryLedger::create([
                        'business_location_id' => $sto->to_location_id,
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

            // Update STO status based on what was received
            if ($allRejected && !$allReceived) {
                $sto->update(['status' => 'cancelled']);
            } elseif (!$allReceived && !$allRejected) {
                $sto->update(['status' => 'partially_received']);
            } else {
                $sto->update(['status' => 'received']);
            }
            
            // Also mark the original internal request as received
            $sto->internalRequest->update(['status' => 'received']);
        });

        return redirect()->route('grns.index')->with('success', 'Goods Receipt Note created successfully.');
    }

    public function show(GoodsReceiptNote $goodsReceiptNote)
    {
        $goodsReceiptNote->load(['items.ingredient', 'items.unitOfMeasure', 'location', 'receivedBy', 'stockTransferOrder.fromLocation']);
        
        return Inertia::render('purchasing/grns/show', [
            'grn' => $goodsReceiptNote,
        ]);
    }
}

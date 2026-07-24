<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\StockTransferOrder;
use App\Models\InventoryBalance;
use App\Models\InventoryLedger;
use Illuminate\Support\Facades\DB;

class StockTransferOrderController extends Controller
{
    public function index()
    {
        $query = StockTransferOrder::with(['fromLocation', 'toLocation']);
        
        $activeLocationId = session('active_location_id');
        if (!auth()->user()->hasRole('admin') || $activeLocationId) {
            $locationId = !auth()->user()->hasRole('admin') ? auth()->user()->business_location_id : $activeLocationId;
            $query->where(function($q) use ($locationId) {
                $q->where('from_location_id', $locationId)
                  ->orWhere('to_location_id', $locationId);
            });
        }
        
        $query->latest();
            
        return Inertia::render('purchasing/stos/index', [
            'stos' => \App\Helpers\TableHelper::query($query)
                ->searchColumns(['sto_number'])
                ->transform(fn ($sto): array => $sto->toArray())
                ->get(),
            'locations' => \App\Models\BusinessLocation::all(),
        ]);
    }

    public function show(StockTransferOrder $stockTransferOrder)
    {
        $stockTransferOrder->load(['items.ingredient', 'items.unitOfMeasure', 'fromLocation', 'toLocation', 'createdBy', 'internalRequest']);
        
        $canDispatch = auth()->user()->hasRole('admin') || (
            auth()->user()->hasPermissionTo('fulfill.internal-requests') && 
            auth()->user()->business_location_id === $stockTransferOrder->from_location_id
        );

        $canReceive = auth()->user()->hasRole('admin') || (
            auth()->user()->business_location_id === $stockTransferOrder->to_location_id
        );

        return Inertia::render('purchasing/stos/show', [
            'sto' => $stockTransferOrder,
            'canDispatch' => $canDispatch,
            'canReceive' => $canReceive,
        ]);
    }

    public function dispatchSto(StockTransferOrder $stockTransferOrder)
    {
        $canDispatch = auth()->user()->hasRole('admin') || (
            auth()->user()->hasPermissionTo('fulfill.internal-requests') && 
            auth()->user()->business_location_id === $stockTransferOrder->from_location_id
        );

        if (!$canDispatch) {
            abort(403, 'Unauthorized action.');
        }

        if ($stockTransferOrder->status !== 'pending_dispatch') {
            return redirect()->back()->with('error', 'STO is not in pending_dispatch state.');
        }

        // Validate reserved stock availability before dispatching
        $insufficientItems = [];
        foreach ($stockTransferOrder->items as $item) {
            $storageLocation = \App\Models\StorageLocation::firstOrCreate(
                [
                    'business_location_id' => $stockTransferOrder->from_location_id,
                    'storage_name' => 'Main Store',
                ],
                [
                    'storage_type' => 'Store',
                    'status' => 1,
                ]
            );

            $balance = InventoryBalance::where('storage_location_id', $storageLocation->id)
                ->where('ingredient_id', $item->ingredient_id)
                ->first();

            $reserved = $balance ? $balance->reserved_qty : 0;
            if ($reserved < $item->approved_quantity) {
                $insufficientItems[] = "{$item->ingredient->name} (Required: {$item->approved_quantity}, Reserved: {$reserved})";
            }
        }

        if (count($insufficientItems) > 0) {
            return redirect()->back()->with('error', 'Insufficient reserved stock to dispatch: ' . implode(', ', $insufficientItems));
        }

        DB::transaction(function () use ($stockTransferOrder) {
            // Re-fetch with a lock to prevent race conditions (double-dispatch)
            $stoLocked = StockTransferOrder::where('id', $stockTransferOrder->id)->lockForUpdate()->first();
            
            if ($stoLocked->status !== 'pending_dispatch') {
                abort(400, 'STO has already been dispatched.');
            }

            $stoLocked->update([
                'status' => 'dispatched',
                'dispatched_at' => now(),
            ]);

            foreach ($stoLocked->items as $item) {
                // Update dispatched quantity to be equal to approved quantity by default
                $item->update(['dispatched_quantity' => $item->approved_quantity]);

                // Find a default storage location for the business location
                $storageLocation = \App\Models\StorageLocation::firstOrCreate(
                    [
                        'business_location_id' => $stockTransferOrder->from_location_id,
                        'storage_name' => 'Main Store',
                    ],
                    [
                        'storage_type' => 'Store',
                        'status' => 1,
                    ]
                );

                // 1. Deduct from InventoryBalance reserved_qty
                $balance = InventoryBalance::firstOrCreate(
                    [
                        'storage_location_id' => $storageLocation->id,
                        'ingredient_id' => $item->ingredient_id,
                    ],
                    ['available_qty' => 0, 'reserved_qty' => 0]
                );
                
                $balance->decrement('reserved_qty', $item->dispatched_quantity);

                // 2. Insert into InventoryLedger (transfer_out)
                InventoryLedger::create([
                    'business_location_id' => $stockTransferOrder->from_location_id,
                    'ingredient_id' => $item->ingredient_id,
                    'transaction_type' => 'transfer_out',
                    'reference_type' => StockTransferOrder::class,
                    'reference_id' => $stockTransferOrder->id,
                    'quantity' => -$item->dispatched_quantity,
                    'running_balance' => $balance->fresh()->available_qty,
                    'created_by' => auth()->id(),
                ]);
            }
        });

        return redirect()->back()->with('success', 'STO Dispatched successfully. Inventory deducted.');
    }

    public function rejectSto(StockTransferOrder $stockTransferOrder)
    {
        $canDispatch = auth()->user()->hasRole('admin') || (
            auth()->user()->hasPermissionTo('fulfill.internal-requests') && 
            auth()->user()->business_location_id === $stockTransferOrder->from_location_id
        );

        if (!$canDispatch) {
            abort(403, 'Unauthorized action.');
        }

        if ($stockTransferOrder->status !== 'pending_dispatch') {
            return redirect()->back()->with('error', 'Only pending STOs can be rejected.');
        }

        DB::transaction(function () use ($stockTransferOrder) {
            $stockTransferOrder->update([
                'status' => 'cancelled',
            ]);
            
            if ($stockTransferOrder->internal_request_id) {
                $stockTransferOrder->internalRequest->update(['status' => 'rejected']);
            }

            // Release reserved stock back to available stock
            foreach ($stockTransferOrder->items as $item) {
                $storageLocation = \App\Models\StorageLocation::firstOrCreate(
                    [
                        'business_location_id' => $stockTransferOrder->from_location_id,
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
                        'ingredient_id' => $item->ingredient_id,
                    ],
                    ['available_qty' => 0, 'reserved_qty' => 0]
                );
                
                $balance->increment('available_qty', $item->approved_quantity);
                $balance->decrement('reserved_qty', $item->approved_quantity);
            }
        });

        return redirect()->back()->with('success', 'STO has been rejected and reserved stock released.');
    }
}

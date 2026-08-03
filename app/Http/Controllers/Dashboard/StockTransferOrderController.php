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
        $query = StockTransferOrder::with(['fromLocation', 'toLocation', 'internalRequest.requestedBy', 'internalRequest.updatedBy', 'grns.receivedBy']);
        
        $activeLocationId = session('active_location_id');
        $locationId = null;
        if (!auth()->user()->hasRole('admin') || $activeLocationId) {
            $locationId = !auth()->user()->hasRole('admin') ? auth()->user()->business_location_id : $activeLocationId;
            
            $type = request('type');
            if ($type === 'incoming') {
                $query->where('to_location_id', $locationId)
                      ->whereIn('status', ['dispatched', 'partially_received']);
            } elseif ($type === 'outgoing') {
                $query->where('from_location_id', $locationId);
            } else {
                $query->where(function($q) use ($locationId) {
                    $q->where('from_location_id', $locationId)
                      ->orWhere('to_location_id', $locationId);
                });
            }
        }
        
        $query->latest();
        
        // Fetch pending internal requests for this location to show them on the STO page
        $pendingRequestsQuery = \App\Models\InternalRequest::with(['fromLocation', 'toLocation', 'requestedBy'])
            ->whereIn('status', ['pending_fulfillment', 'partially_fulfilled']);
            
        if ($locationId) {
            $pendingRequestsQuery->where('from_location_id', $locationId);
        }
            
        return Inertia::render('purchasing/stos/index', [
            'stos' => \App\Helpers\TableHelper::query($query)
                ->searchColumns(['sto_number'])
                ->transform(fn ($sto): array => $sto->toArray())
                ->get(),
            'locations' => \App\Models\BusinessLocation::all(),
            'pendingRequests' => $pendingRequestsQuery->latest()->get(),
            'type' => request('type'),
        ]);
    }

    public function show(StockTransferOrder $stockTransferOrder)
    {
        $stockTransferOrder->load(['items.ingredient' => fn($q) => $q->withTrashed(), 'items.unitOfMeasure', 'fromLocation', 'toLocation', 'createdBy', 'internalRequest']);
        
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
            'workflow' => request('workflow', 'manage'),
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

        // Validate actual stock availability before dispatching
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

            $available = $balance ? $balance->available_qty : 0;
            if ($available < $item->approved_quantity) {
                $insufficientItems[] = "{$item->ingredient->name} (Required: {$item->approved_quantity}, Available: {$available})";
            }
        }

        if (count($insufficientItems) > 0) {
            return redirect()->back()->with('error', 'Insufficient stock to dispatch: ' . implode(', ', $insufficientItems));
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

                // 1. Deduct from InventoryBalance available_qty (we didn't reserve it earlier)
                $balance = InventoryBalance::firstOrCreate(
                    [
                        'storage_location_id' => $storageLocation->id,
                        'ingredient_id' => $item->ingredient_id,
                    ],
                    ['available_qty' => 0, 'reserved_qty' => 0]
                );
                
                $balance->decrement('available_qty', $item->dispatched_quantity);

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
                $stockTransferOrder->internalRequest->update([
                    'status' => 'rejected',
                    'updated_by' => auth()->id()
                ]);
            }

        });

        return redirect()->back()->with('success', 'STO has been rejected.');
    }
}

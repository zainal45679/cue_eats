<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\InternalRequest;

class InternalRequestController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', InternalRequest::class);
        
        $query = InternalRequest::with(['fromLocation', 'toLocation', 'requestedBy', 'updatedBy', 'stos.grns.receivedBy', 'items']);
        
        $activeLocationId = session('active_location_id');
        if (!auth()->user()->hasRole('admin') || $activeLocationId) {
            $locationId = !auth()->user()->hasRole('admin') ? auth()->user()->business_location_id : $activeLocationId;
            $query->where('to_location_id', $locationId);
        }
        
        $query->latest();
            
        return Inertia::render('purchasing/internal-requests/index', [
            'internalRequests' => \App\Helpers\TableHelper::query($query)
                ->searchColumns(['request_number'])
                ->transform(fn ($ir): array => $ir->toArray())
                ->get(),
            'locations' => \App\Models\BusinessLocation::all(),
        ]);
    }

    public function create()
    {
        $this->authorize('create', InternalRequest::class);
        return Inertia::render('purchasing/internal-requests/create', [
            'locations' => \App\Models\BusinessLocation::all(),
            'ingredients' => \App\Models\Ingredient::with(['category', 'baseUom'])->get(),
            'categories' => \App\Models\IngredientCategory::all(),
        ]);
    }

    public function store(\App\Http\Requests\StoreInternalRequestRequest $request)
    {
        $this->authorize('create', InternalRequest::class);
        \Illuminate\Support\Facades\DB::transaction(function () use ($request) {
            $data = $request->validated();
            $items = \Illuminate\Support\Arr::pull($data, 'items');
            
            $data['created_by'] = auth()->id();
            $data['requested_by_id'] = auth()->id();
            
            // Security: Enforce tenant scope. A branch user can only request items FOR their own branch.
            $toLocId = auth()->user()->hasRole('admin') ? $data['to_location_id'] : (auth()->user()->business_location_id ?? $data['to_location_id']);
            $data['to_location_id'] = \App\Models\BusinessLocation::where('id', $toLocId)->exists() ? $toLocId : \App\Models\BusinessLocation::first()?->id;

            $data['request_number'] = 'REQ-' . time(); // Simple generator
            $data['status'] = 'pending_approval'; // Skip draft, go straight to pending approval

        $ir = InternalRequest::create($data);

        foreach ($items as $item) {
            $ingredient = \App\Models\Ingredient::find($item['ingredient_id']);
            $item['uom_id'] = $ingredient->base_uom_id;
            $ir->items()->create($item);
        }
    });

    return redirect()->route('internal-requests.index')->with('success', 'Internal Request created.');
    }

    public function show(InternalRequest $internalRequest)
    {
        $this->authorize('view', $internalRequest);
        
        $internalRequest->load(['items.ingredient' => fn($q) => $q->withTrashed(), 'items.unitOfMeasure', 'fromLocation', 'toLocation', 'requestedBy', 'stos.items.ingredient' => fn($q) => $q->withTrashed()]);
        
        return Inertia::render('purchasing/internal-requests/show', [
            'internalRequest' => $internalRequest,
            'locations' => \App\Models\BusinessLocation::all(),
            'ingredients' => \App\Models\Ingredient::with(['category', 'baseUom'])->get(),
            'categories' => \App\Models\IngredientCategory::all(),
            'canApprove' => auth()->user()->can('approve', $internalRequest),
            'canFulfill' => auth()->user()->can('fulfill', $internalRequest),
        ]);
    }

    public function edit(InternalRequest $internalRequest)
    {
        $this->authorize('update', $internalRequest);

        $internalRequest->load('items.ingredient');
        return Inertia::render('purchasing/internal-requests/edit', [
            'internalRequest' => $internalRequest,
            'locations' => \App\Models\BusinessLocation::all(),
            'ingredients' => \App\Models\Ingredient::with(['category', 'baseUom'])->get(),
            'categories' => \App\Models\IngredientCategory::all(),
        ]);
    }

    public function update(\App\Http\Requests\UpdateInternalRequestRequest $request, InternalRequest $internalRequest)
    {
        $this->authorize('update', $internalRequest);
        
        if (!in_array($internalRequest->status, ['draft', 'pending_approval'])) {
            abort(403, 'Only draft or pending internal requests can be updated.');
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($request, $internalRequest) {
            $data = $request->validated();
            $items = \Illuminate\Support\Arr::pull($data, 'items');
            
            $data['updated_by'] = auth()->id();
            
            $internalRequest->update($data);

            // Recreate items for simplicity
            $internalRequest->items()->delete();
            
            foreach ($items as $item) {
                $ingredient = \App\Models\Ingredient::find($item['ingredient_id']);
                $item['uom_id'] = $ingredient->base_uom_id;
                $internalRequest->items()->create($item);
            }
        });

        return redirect()->route('internal-requests.index')->with('success', 'Internal Request updated.');
    }

    public function destroy(InternalRequest $internalRequest)
    {
        $this->authorize('delete', $internalRequest);
        
        if (!in_array($internalRequest->status, ['draft', 'pending_approval'])) {
            abort(403, 'Only draft or pending internal requests can be deleted.');
        }

        $internalRequest->items()->forceDelete();
        $internalRequest->forceDelete();
        return redirect()->route('internal-requests.index')->with('success', 'Internal Request deleted.');
    }

    public function approve(InternalRequest $internalRequest)
    {
        $this->authorize('approve', $internalRequest);
        
        if (!in_array($internalRequest->status, ['draft', 'pending_approval'])) {
            abort(400, 'This Internal Request cannot be approved in its current state.');
        }

        $internalRequest->update(['status' => 'pending_fulfillment']);

        return redirect()->route('internal-requests.index')->with('success', 'Indent approved. Waiting for fulfillment by sender.');
    }

    public function fulfill(InternalRequest $internalRequest)
    {
        $this->authorize('fulfill', $internalRequest);
        
        if (!in_array($internalRequest->status, ['draft', 'pending_fulfillment', 'partially_fulfilled'])) {
            abort(400, 'This Internal Request cannot be fulfilled in its current state.');
        }
        $internalRequest->load([
            'items.ingredient', 
            'items.unitOfMeasure', 
            'fromLocation', 
            'toLocation', 
            'requestedBy',
            'stos.items.ingredient' => fn($q) => $q->withTrashed()
        ]);

        $fromLocId = \App\Models\BusinessLocation::where('id', $internalRequest->from_location_id)->exists() 
            ? $internalRequest->from_location_id 
            : \App\Models\BusinessLocation::first()?->id;

        // Fetch storage locations for the sending location
        $storageLocations = \App\Models\StorageLocation::where('business_location_id', $fromLocId)
            ->where('status', true)
            ->get();

        // Load live stock for the sending location (both overall and per storage location)
        foreach ($internalRequest->items as $item) {
            $balances = \App\Models\InventoryBalance::whereHas('storageLocation', function($q) use ($fromLocId) {
                $q->where('business_location_id', $fromLocId);
            })->where('ingredient_id', $item->ingredient_id)->get();

            $item->live_stock = $balances->sum('available_qty');
            $item->storage_stock = $balances->pluck('available_qty', 'storage_location_id')->toArray();
        }

        return Inertia::render('purchasing/internal-requests/fulfill', [
            'internalRequest' => $internalRequest,
            'storageLocations' => $storageLocations,
        ]);
    }

    public function storeFulfill(\Illuminate\Http\Request $request, InternalRequest $internalRequest)
    {
        $this->authorize('fulfill', $internalRequest);
        
        if (!in_array($internalRequest->status, ['draft', 'pending_fulfillment', 'partially_fulfilled'])) {
            abort(400, 'This Internal Request cannot be fulfilled in its current state.');
        }

        $data = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:internal_request_items,id',
            'items.*.dispatch_quantity' => 'required|numeric|min:0',
            'items.*.reject_quantity' => 'required|numeric|min:0',
            'items.*.from_storage_location_id' => 'nullable|exists:storage_locations,id',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($internalRequest, $data) {
            $hasDispatchedAnything = false;
            $allItemsProcessed = true;
            
            $dispatchedItems = [];

            foreach ($data['items'] as $itemData) {
                $item = $internalRequest->items()->find($itemData['id']);
                
                $remainingBefore = $item->quantity - $item->dispatched_quantity - $item->rejected_quantity;
                $dispatchQty = (float) $itemData['dispatch_quantity'];
                $rejectQty = (float) $itemData['reject_quantity'];
                
                if (round($dispatchQty + $rejectQty, 2) > round($remainingBefore, 2)) {
                    abort(422, "Cannot process more than requested for {$item->ingredient->name}. (Pending: {$remainingBefore}, You entered Dispatch: {$dispatchQty}, Reject: {$rejectQty})");
                }

                $item->increment('dispatched_quantity', $dispatchQty);
                $item->increment('rejected_quantity', $rejectQty);
                
                if ($dispatchQty > 0) {
                    $hasDispatchedAnything = true;
                    $dispatchedItems[] = [
                        'ingredient_id' => $item->ingredient_id,
                        'approved_quantity' => $dispatchQty, 
                        'dispatched_quantity' => $dispatchQty, 
                        'uom_id' => $item->uom_id,
                        'from_storage_location_id' => $itemData['from_storage_location_id'] ?? null,
                    ];
                }

                $remainingAfter = $remainingBefore - $dispatchQty - $rejectQty;
                if ($remainingAfter > 0) {
                    $allItemsProcessed = false;
                }
            }

            if ($hasDispatchedAnything) {
                // Ensure valid location UUIDs exist in business_locations
                $fromLocation = \App\Models\BusinessLocation::find($internalRequest->from_location_id) 
                    ?? \App\Models\BusinessLocation::where('is_parent_location', true)->first() 
                    ?? \App\Models\BusinessLocation::first();
                    
                $toLocation = \App\Models\BusinessLocation::find($internalRequest->to_location_id) 
                    ?? \App\Models\BusinessLocation::where('id', '!=', $fromLocation->id)->first() 
                    ?? $fromLocation;

                if ($internalRequest->from_location_id !== $fromLocation->id || $internalRequest->to_location_id !== $toLocation->id) {
                    $internalRequest->update([
                        'from_location_id' => $fromLocation->id,
                        'to_location_id' => $toLocation->id,
                    ]);
                }

                $sto = \App\Models\StockTransferOrder::create([
                    'internal_request_id' => $internalRequest->id,
                    'sto_number' => 'STO-' . time(),
                    'from_location_id' => $fromLocation->id,
                    'to_location_id' => $toLocation->id,
                    'status' => 'dispatched',
                    'dispatched_at' => now(),
                    'created_by' => auth()->id(),
                ]);

                foreach ($dispatchedItems as $dItem) {
                    $stoItem = $sto->items()->create([
                        'ingredient_id' => $dItem['ingredient_id'],
                        'approved_quantity' => $dItem['approved_quantity'],
                        'dispatched_quantity' => $dItem['dispatched_quantity'],
                        'uom_id' => $dItem['uom_id'],
                    ]);

                    // Resolve target storage location for dispatching
                    $targetStorageId = $dItem['from_storage_location_id'];
                    if (!$targetStorageId) {
                        // Find storage location in sending branch with highest stock for this ingredient
                        $targetStorageId = \App\Models\InventoryBalance::whereHas('storageLocation', function($q) use ($fromLocation) {
                            $q->where('business_location_id', $fromLocation->id);
                        })
                        ->where('ingredient_id', $dItem['ingredient_id'])
                        ->orderByDesc('available_qty')
                        ->value('storage_location_id');

                        if (!$targetStorageId) {
                            $defaultLoc = \App\Models\StorageLocation::firstOrCreate(
                                ['business_location_id' => $fromLocation->id, 'storage_name' => 'Main Store'],
                                ['storage_type' => 'Store', 'status' => 1]
                            );
                            $targetStorageId = $defaultLoc->id;
                        }
                    }

                    $balance = \App\Models\InventoryBalance::firstOrCreate(
                        [
                            'storage_location_id' => $targetStorageId,
                            'ingredient_id' => $dItem['ingredient_id'],
                        ],
                        ['available_qty' => 0, 'reserved_qty' => 0]
                    );

                    $targetStorage = \App\Models\StorageLocation::find($targetStorageId);
                    $ingredient = \App\Models\Ingredient::find($dItem['ingredient_id']);

                    // Enforce Non-Negative Dispatch Validation
                    if ((float) $balance->available_qty < (float) $dItem['dispatched_quantity']) {
                        throw \Illuminate\Validation\ValidationException::withMessages([
                            'items' => "Cannot dispatch {$dItem['dispatched_quantity']} of " . ($ingredient ? $ingredient->name : 'ingredient') . ". Only {$balance->available_qty} available in " . ($targetStorage ? $targetStorage->storage_name : 'storage') . "."
                        ]);
                    }

                    $balance->decrement('available_qty', $dItem['dispatched_quantity']);

                    \App\Models\InventoryLedger::create([
                        'business_location_id' => $fromLocation->id,
                        'storage_location_id' => $targetStorageId,
                        'ingredient_id' => $dItem['ingredient_id'],
                        'transaction_type' => 'transfer_out',
                        'reference_type' => \App\Models\StockTransferOrder::class,
                        'reference_id' => $sto->id,
                        'quantity' => -$dItem['dispatched_quantity'],
                        'running_balance' => $balance->fresh()->available_qty,
                        'created_by' => auth()->id() ?? \App\Models\User::first()?->id,
                    ]);
                }
            }

            if ($allItemsProcessed) {
                $internalRequest->update(['status' => 'fulfilled']);
                $message = "Your request {$internalRequest->request_number} has been fully completed.";
                $type = 'success';
            } else {
                $internalRequest->update(['status' => 'partially_fulfilled']);
                if ($hasDispatchedAnything) {
                    $stoCount = \App\Models\StockTransferOrder::where('internal_request_id', $internalRequest->id)->count();
                    $message = $stoCount > 1 
                        ? "An additional shipment for {$internalRequest->request_number} has been dispatched."
                        : "Your request {$internalRequest->request_number} has been partially fulfilled.";
                    $type = 'info';
                } else {
                    $message = "Some remaining quantities for {$internalRequest->request_number} have been rejected.";
                    $type = 'warning';
                }
            }

            if ($internalRequest->requestedBy && isset($message)) {
                $internalRequest->requestedBy->notify(new \App\Notifications\InternalRequestUpdatedNotification($internalRequest, $message, $type));
            }
        });

        return redirect()->route('internal-requests.index')->with('success', 'Fulfillment recorded successfully.');
    }

    public function reject(InternalRequest $internalRequest)
    {
        $this->authorize('reject', $internalRequest);
        if (!in_array($internalRequest->status, ['draft', 'pending_fulfillment', 'partially_fulfilled'])) {
            abort(400, 'This Internal Request cannot be rejected in its current state.');
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($internalRequest) {
            $hasDispatchedAnything = false;

            foreach ($internalRequest->items as $item) {
                if ($item->dispatched_quantity > 0) {
                    $hasDispatchedAnything = true;
                }
                
                $remaining = max(0, $item->quantity - $item->dispatched_quantity - $item->rejected_quantity);
                if ($remaining > 0) {
                    $item->increment('rejected_quantity', $remaining);
                }
            }

            $internalRequest->update([
                'status' => $hasDispatchedAnything ? 'partially_rejected' : 'rejected',
                'updated_by' => auth()->id()
            ]);

            if ($internalRequest->requestedBy) {
                $message = "The remaining quantities for {$internalRequest->request_number} have been rejected.";
                $internalRequest->requestedBy->notify(new \App\Notifications\InternalRequestUpdatedNotification($internalRequest, $message, 'warning'));
            }
        });

        return redirect()->back()->with('success', 'Remaining request rejected.');
    }
}

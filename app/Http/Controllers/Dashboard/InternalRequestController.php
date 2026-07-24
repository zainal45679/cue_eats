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
        
        $query = InternalRequest::with(['fromLocation', 'toLocation', 'requestedBy']);
        
        $activeLocationId = session('active_location_id');
        if (!auth()->user()->hasRole('admin') || $activeLocationId) {
            $locationId = !auth()->user()->hasRole('admin') ? auth()->user()->business_location_id : $activeLocationId;
            $query->where(function($q) use ($locationId) {
                $q->where('from_location_id', $locationId)
                  ->orWhere('to_location_id', $locationId);
            });
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
            $toLocId = auth()->user()->hasRole('admin') ? $data['to_location_id'] : auth()->user()->business_location_id;
            $data['to_location_id'] = $toLocId;

            $data['request_number'] = 'REQ-' . time(); // Simple generator
            $data['status'] = 'draft'; // Always save as draft initially

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
        
        $internalRequest->load(['items.ingredient', 'items.unitOfMeasure', 'fromLocation', 'toLocation', 'requestedBy']);
        
        return Inertia::render('purchasing/internal-requests/show', [
            'internalRequest' => $internalRequest,
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
        $internalRequest->items()->forceDelete();
        $internalRequest->forceDelete();
        return redirect()->route('internal-requests.index')->with('success', 'Internal Request deleted.');
    }

    public function approve(InternalRequest $internalRequest)
    {
        $this->authorize('approve', $internalRequest);
        
        $insufficientItems = [];
        \Illuminate\Support\Facades\DB::transaction(function () use ($internalRequest, &$insufficientItems) {
            // First check if all items have enough stock
            foreach ($internalRequest->items as $item) {
                $storageLocation = \App\Models\StorageLocation::firstOrCreate(
                    [
                        'business_location_id' => $internalRequest->from_location_id,
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
                    ['available_qty' => 0, 'reserved_qty' => 0]
                );

                if ($balance->available_qty < $item->quantity) {
                    $ingredientName = \App\Models\Ingredient::find($item->ingredient_id)->name ?? 'Unknown Item';
                    $insufficientItems[] = "{$ingredientName} (Requested: {$item->quantity}, Available: {$balance->available_qty})";
                }
            }
            
            if (count($insufficientItems) > 0) {
                return; // Rollback transaction via early exit (technically DB::transaction will commit what was done before, but we didn't write anything yet)
            }

            $internalRequest->update(['status' => 'converted_to_sto']);
            $sto = \App\Models\StockTransferOrder::create([
                'internal_request_id' => $internalRequest->id,
                'sto_number' => 'STO-' . time(),
                'from_location_id' => $internalRequest->from_location_id,
                'to_location_id' => $internalRequest->to_location_id,
                'status' => 'pending_dispatch',
                'created_by' => auth()->id(),
            ]);

            foreach ($internalRequest->items as $item) {
                $sto->items()->create([
                    'ingredient_id' => $item->ingredient_id,
                    'approved_quantity' => $item->quantity,
                    'dispatched_quantity' => 0,
                    'uom_id' => $item->uom_id,
                ]);

                // Reserve the inventory
                $storageLocation = \App\Models\StorageLocation::firstOrCreate(
                    [
                        'business_location_id' => $internalRequest->from_location_id,
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
                    ['available_qty' => 0, 'reserved_qty' => 0]
                );

                $balance->decrement('available_qty', $item->quantity);
                $balance->increment('reserved_qty', $item->quantity);
            }
        });

        if (count($insufficientItems) > 0) {
            $outletName = $internalRequest->fromLocation->location_name ?? 'this outlet';
            return redirect()->back()->with('error', "Stock not available in {$outletName} for: " . implode(', ', $insufficientItems));
        }

        return redirect()->route('internal-requests.index')->with('success', 'Indent approved and STO generated.');
    }

    public function reject(InternalRequest $internalRequest)
    {
        $this->authorize('reject', $internalRequest);
        $internalRequest->update(['status' => 'rejected']);
        return redirect()->back()->with('success', 'Indent rejected.');
    }
}

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
        
        if (!auth()->user()->hasRole('admin')) {
            $locationId = auth()->user()->business_location_id;
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
        ]);
    }

    public function create()
    {
        $this->authorize('create', InternalRequest::class);
        return Inertia::render('purchasing/internal-requests/create', [
            'locations' => \App\Models\BusinessLocation::all(),
            'ingredients' => \App\Models\Ingredient::with('category')->get(),
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
            $data['request_number'] = 'REQ-' . time(); // Simple generator
            
            // If the user can approve, skip draft and go straight to pending_fulfillment
            $data['status'] = auth()->user()->hasPermissionTo('approve.internal-requests') ? 'pending_fulfillment' : 'draft';

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
            'ingredients' => \App\Models\Ingredient::with('category')->get(),
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
        $internalRequest->delete();
        return redirect()->route('internal-requests.index')->with('success', 'Internal Request deleted.');
    }

    public function approve(InternalRequest $internalRequest)
    {
        $this->authorize('approve', $internalRequest);
        
        \Illuminate\Support\Facades\DB::transaction(function () use ($internalRequest) {
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
            }
        });

        return redirect()->route('internal-requests.index')->with('success', 'Indent approved and STO generated.');
    }

    public function reject(InternalRequest $internalRequest)
    {
        $this->authorize('reject', $internalRequest);
        $internalRequest->update(['status' => 'rejected']);
        return redirect()->back()->with('success', 'Indent rejected.');
    }
}

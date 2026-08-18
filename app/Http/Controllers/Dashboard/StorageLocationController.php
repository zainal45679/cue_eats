<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Enums\EntityEnum;
use App\Helpers\GateHelper;
use App\Helpers\TableHelper;
use App\Http\Controllers\Controller;
use App\Models\BusinessLocation;
use App\Models\StorageLocation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

final class StorageLocationController extends Controller
{
    public function index(Request $request): Response
    {
        GateHelper::read(EntityEnum::StorageLocations);

        $query = StorageLocation::with('businessLocation');
        if (!auth()->user()->hasRole('admin')) {
            $query->where('business_location_id', auth()->user()->business_location_id);
        }

        $storageLocations = TableHelper::query($query)
            ->searchColumns(['storage_name', 'storage_type'])
            ->get();

        return inertia('inventory-setup/storage-locations/index', [
            'storageLocations' => $storageLocations,
        ]);
    }

    public function create(): Response
    {
        GateHelper::create(EntityEnum::StorageLocations);

        $businessLocations = BusinessLocation::where('status', true)->get();

        return inertia('inventory-setup/storage-locations/add', [
            'businessLocations' => $businessLocations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        GateHelper::create(EntityEnum::StorageLocations);

        $validated = $request->validate([
            'business_location_id' => ['required', 'exists:business_locations,id'],
            'storage_name' => ['required', 'string', 'max:255'],
            'storage_type' => ['required', 'string', 'max:255'],
            'default_receiving_location' => ['nullable', 'string', 'max:255'],
            'default_issue_location' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'boolean'],
        ]);

        StorageLocation::create($validated);

        return redirect()->route('storage-locations.index')
            ->with('success', 'Storage Location created successfully.');
    }

    public function show(string $id): Response
    {
        GateHelper::read(EntityEnum::StorageLocations);
        
        $storageLocation = StorageLocation::with('businessLocation')->findOrFail($id);

        return inertia('inventory-setup/storage-locations/show', [
            'storageLocation' => $storageLocation,
        ]);
    }

    public function edit(string $id): Response
    {
        GateHelper::update(EntityEnum::StorageLocations);

        $storageLocation = StorageLocation::findOrFail($id);
        $businessLocations = BusinessLocation::where('status', true)->get();

        return inertia('inventory-setup/storage-locations/edit', [
            'storageLocation' => $storageLocation,
            'businessLocations' => $businessLocations,
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        GateHelper::update(EntityEnum::StorageLocations);

        $storageLocation = StorageLocation::findOrFail($id);

        $validated = $request->validate([
            'business_location_id' => ['required', 'exists:business_locations,id'],
            'storage_name' => ['required', 'string', 'max:255'],
            'storage_type' => ['required', 'string', 'max:255'],
            'default_receiving_location' => ['nullable', 'string', 'max:255'],
            'default_issue_location' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'boolean'],
        ]);

        $storageLocation->update($validated);

        return redirect()->route('storage-locations.index')
            ->with('success', 'Storage Location updated successfully.');
    }

    public function destroy(string $id): RedirectResponse
    {
        GateHelper::delete(EntityEnum::StorageLocations);

        $storageLocation = StorageLocation::findOrFail($id);
        $storageLocation->delete();

        return redirect()->route('storage-locations.index')
            ->with('success', 'Storage Location deleted successfully.');
    }

    public function search(Request $request): \Illuminate\Http\JsonResponse
    {
        GateHelper::read(EntityEnum::StorageLocations);
        $query = StorageLocation::query();

        if (!auth()->user()->hasRole('admin')) {
            $query->where('business_location_id', auth()->user()->business_location_id);
        }

        return TableHelper::search($request, $query, ['storage_name', 'storage_type']);
    }

    public function transfer(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'from_storage_location_id' => ['required', 'exists:storage_locations,id'],
            'to_storage_location_id' => ['required', 'exists:storage_locations,id', 'different:from_storage_location_id'],
            'ingredient_id' => ['required', 'exists:ingredients,id'],
            'quantity' => ['required', 'numeric', 'min:0.001'],
        ]);

        $fromStorage = StorageLocation::findOrFail($validated['from_storage_location_id']);
        $toStorage = StorageLocation::findOrFail($validated['to_storage_location_id']);

        if ($fromStorage->business_location_id !== $toStorage->business_location_id) {
            return back()->withErrors(['error' => 'Inter-storage transfers can only occur within the same branch location.']);
        }

        $qty = (float) $validated['quantity'];

        \Illuminate\Support\Facades\DB::transaction(function () use ($fromStorage, $toStorage, $validated, $qty) {
            $fromBalance = \App\Models\InventoryBalance::firstOrCreate(
                ['storage_location_id' => $fromStorage->id, 'ingredient_id' => $validated['ingredient_id']],
                ['available_qty' => 0, 'reserved_qty' => 0]
            );

            if ((float) $fromBalance->available_qty < $qty) {
                $ingredient = \App\Models\Ingredient::find($validated['ingredient_id']);
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'quantity' => "Insufficient stock in {$fromStorage->storage_name} for " . ($ingredient ? $ingredient->name : 'item') . ". (Available: {$fromBalance->available_qty})"
                ]);
            }

            $toBalance = \App\Models\InventoryBalance::firstOrCreate(
                ['storage_location_id' => $toStorage->id, 'ingredient_id' => $validated['ingredient_id']],
                ['available_qty' => 0, 'reserved_qty' => 0]
            );

            // Deduct from Source
            $fromBalance->decrement('available_qty', $qty);
            // Increment Destination
            $toBalance->increment('available_qty', $qty);

            // Log Source Ledger
            \App\Models\InventoryLedger::create([
                'business_location_id' => $fromStorage->business_location_id,
                'storage_location_id' => $fromStorage->id,
                'ingredient_id' => $validated['ingredient_id'],
                'transaction_type' => 'storage_transfer',
                'reference_type' => StorageLocation::class,
                'reference_id' => $toStorage->id,
                'quantity' => -$qty,
                'running_balance' => $fromBalance->fresh()->available_qty,
                'created_by' => auth()->id() ?? \App\Models\User::first()?->id,
            ]);

            // Log Destination Ledger
            \App\Models\InventoryLedger::create([
                'business_location_id' => $toStorage->business_location_id,
                'storage_location_id' => $toStorage->id,
                'ingredient_id' => $validated['ingredient_id'],
                'transaction_type' => 'storage_transfer',
                'reference_type' => StorageLocation::class,
                'reference_id' => $fromStorage->id,
                'quantity' => $qty,
                'running_balance' => $toBalance->fresh()->available_qty,
                'created_by' => auth()->id() ?? \App\Models\User::first()?->id,
            ]);
        });

        return back()->with('success', 'Stock transferred successfully.');
    }
}

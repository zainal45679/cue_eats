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
}

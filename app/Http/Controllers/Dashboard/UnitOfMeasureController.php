<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Enums\EntityEnum;
use App\Helpers\GateHelper;
use App\Helpers\TableHelper;
use App\Http\Controllers\Controller;
use App\Models\UnitOfMeasure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

final class UnitOfMeasureController extends Controller
{
    public function search(Request $request): \Illuminate\Http\JsonResponse
    {
        GateHelper::read(EntityEnum::UnitsOfMeasure);

        $query = UnitOfMeasure::query()->with('baseUnit');
        return TableHelper::search($request, $query, ['name', 'code', 'type']);
    }

    public function index(Request $request): Response
    {
        GateHelper::read(EntityEnum::UnitsOfMeasure);

        $unitsOfMeasure = TableHelper::query(UnitOfMeasure::with('baseUnit'))
            ->searchColumns(['name', 'code', 'type'])
            ->get();

        return inertia('inventory-setup/units-of-measure/index', [
            'unitsOfMeasure' => $unitsOfMeasure,
        ]);
    }

    public function create(): Response
    {
        GateHelper::create(EntityEnum::UnitsOfMeasure);

        $baseUnits = UnitOfMeasure::where('status', true)->get(['id', 'name', 'code']);

        return inertia('inventory-setup/units-of-measure/add', [
            'baseUnits' => $baseUnits,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        GateHelper::create(EntityEnum::UnitsOfMeasure);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50'],
            'type' => ['required', 'string', 'in:Weight,Volume,Length,Count'],
            'base_unit_id' => ['nullable', 'exists:units_of_measure,id'],
            'conversion_factor' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'boolean'],
        ]);

        UnitOfMeasure::create($validated);

        return redirect()->route('units-of-measure.index')
            ->with('success', 'Unit of Measure created successfully.');
    }

    public function show(string $id): Response
    {
        GateHelper::read(EntityEnum::UnitsOfMeasure);

        $unitOfMeasure = UnitOfMeasure::with('baseUnit')->findOrFail($id);

        return inertia('inventory-setup/units-of-measure/show', [
            'unitOfMeasure' => $unitOfMeasure,
        ]);
    }

    public function edit(string $id): Response
    {
        GateHelper::update(EntityEnum::UnitsOfMeasure);

        $unitOfMeasure = UnitOfMeasure::findOrFail($id);
        
        // Prevent self-referencing base unit
        $baseUnits = UnitOfMeasure::where('status', true)
            ->where('id', '!=', $unitOfMeasure->id)
            ->get(['id', 'name', 'code']);

        return inertia('inventory-setup/units-of-measure/edit', [
            'unitOfMeasure' => $unitOfMeasure,
            'baseUnits' => $baseUnits,
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        GateHelper::update(EntityEnum::UnitsOfMeasure);

        $unitOfMeasure = UnitOfMeasure::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50'],
            'type' => ['required', 'string', 'in:Weight,Volume,Length,Count'],
            'base_unit_id' => ['nullable', 'exists:units_of_measure,id', 'not_in:'.$unitOfMeasure->id],
            'conversion_factor' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'boolean'],
        ]);

        $unitOfMeasure->update($validated);

        return redirect()->route('units-of-measure.index')
            ->with('success', 'Unit of Measure updated successfully.');
    }

    public function destroy(string $id): RedirectResponse
    {
        GateHelper::delete(EntityEnum::UnitsOfMeasure);

        $unitOfMeasure = UnitOfMeasure::findOrFail($id);
        
        try {
            $unitOfMeasure->delete();
            return redirect()->route('units-of-measure.index')
                ->with('success', 'Unit of Measure deleted successfully.');
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23000') {
                return redirect()->back()
                    ->with('error', 'Cannot delete this unit of measure because it is used in existing ingredients or as a base unit.');
            }
            throw $e;
        }
    }
}

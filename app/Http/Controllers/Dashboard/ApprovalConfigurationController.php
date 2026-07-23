<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Enums\EntityEnum;
use App\Helpers\GateHelper;
use App\Helpers\TableHelper;
use App\Models\ApprovalConfiguration;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApprovalConfigurationController extends Controller
{
    public function index()
    {
        GateHelper::read(EntityEnum::ApprovalConfigurations);

        $data = TableHelper::query(ApprovalConfiguration::query())
            ->searchColumns(['org_size_tier', 'approver_sequence_rule'])
            ->get();

        return Inertia::render('inventory-setup/approval-configurations/index', [
            'approvalConfigurations' => $data,
        ]);
    }

    public function create()
    {
        GateHelper::create(EntityEnum::ApprovalConfigurations);
        return Inertia::render('inventory-setup/approval-configurations/add');
    }

    public function store(Request $request)
    {
        GateHelper::create(EntityEnum::ApprovalConfigurations);

        $validated = $request->validate([
            'org_size_tier' => 'required|string|max:255',
            'num_approvers_required' => 'required|integer|min:1',
            'approver_sequence_rule' => 'required|string|in:Sequential,Parallel',
            'status' => 'boolean',
        ]);

        ApprovalConfiguration::create($validated);

        return redirect()->route('approval-configurations.index')->with('success', 'Approval configuration created successfully.');
    }

    public function edit(string $uuid)
    {
        GateHelper::update(EntityEnum::ApprovalConfigurations);
        
        $approvalConfiguration = ApprovalConfiguration::where('uuid', $uuid)->firstOrFail();

        return Inertia::render('inventory-setup/approval-configurations/edit', [
            'approvalConfiguration' => $approvalConfiguration
        ]);
    }

    public function update(Request $request, string $uuid)
    {
        GateHelper::update(EntityEnum::ApprovalConfigurations);
        
        $approvalConfiguration = ApprovalConfiguration::where('uuid', $uuid)->firstOrFail();

        $validated = $request->validate([
            'org_size_tier' => 'required|string|max:255',
            'num_approvers_required' => 'required|integer|min:1',
            'approver_sequence_rule' => 'required|string|in:Sequential,Parallel',
            'status' => 'boolean',
        ]);

        $approvalConfiguration->update($validated);

        return redirect()->route('approval-configurations.index')->with('success', 'Approval configuration updated successfully.');
    }

    public function destroy(string $uuid)
    {
        GateHelper::delete(EntityEnum::ApprovalConfigurations);
        
        $approvalConfiguration = ApprovalConfiguration::where('uuid', $uuid)->firstOrFail();
        $approvalConfiguration->delete();
        
        return redirect()->route('approval-configurations.index')->with('success', 'Approval configuration deleted successfully.');
    }
}

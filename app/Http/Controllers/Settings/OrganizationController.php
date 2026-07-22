<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateOrganizationRequest;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class OrganizationController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('settings/organization', [
            'organization' => Organization::current(),
        ]);
    }

    public function update(UpdateOrganizationRequest $request): RedirectResponse
    {
        $organization = Organization::current();
        $validated = $request->validated();

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('organization', 'public');
        }

        $organization->update($validated);

        return to_route('organization.edit')->with('success', 'Organization settings updated successfully.');
    }
}

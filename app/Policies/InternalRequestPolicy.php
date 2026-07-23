<?php

namespace App\Policies;

use App\Models\InternalRequest;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class InternalRequestPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('read.internal-requests');
    }

    public function view(User $user, InternalRequest $internalRequest): bool
    {
        if ($user->hasRole('admin')) return true;
        
        if (!$user->hasPermissionTo('read.internal-requests')) return false;

        return $user->business_location_id === $internalRequest->from_location_id || 
               $user->business_location_id === $internalRequest->to_location_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create.internal-requests');
    }

    public function update(User $user, InternalRequest $internalRequest): bool
    {
        if ($user->hasRole('admin')) return true;
        
        if (!$user->hasPermissionTo('update.internal-requests')) return false;

        return $user->business_location_id === $internalRequest->to_location_id && $internalRequest->status === 'draft';
    }

    public function delete(User $user, InternalRequest $internalRequest): bool
    {
        if ($user->hasRole('admin')) return true;
        
        if (!$user->hasPermissionTo('delete.internal-requests')) return false;

        return $user->business_location_id === $internalRequest->to_location_id && $internalRequest->status === 'draft';
    }

    public function approve(User $user, InternalRequest $internalRequest): bool
    {
        if ($user->hasRole('admin')) return true;
        
        // Only someone with approve permission at the requesting location can approve
        if (!$user->hasPermissionTo('approve.internal-requests')) return false;
        
        return $user->business_location_id === $internalRequest->to_location_id &&
               $internalRequest->status === 'draft';
    }

    public function reject(User $user, InternalRequest $internalRequest): bool
    {
        if ($user->hasRole('admin')) return true;
        
        // Both the requesting side (approve perms) and fulfilling side (fulfill perms) can reject
        $canRejectAsRequester = $user->hasPermissionTo('approve.internal-requests') && $user->business_location_id === $internalRequest->to_location_id;
        $canRejectAsFulfiller = $user->hasPermissionTo('fulfill.internal-requests') && $user->business_location_id === $internalRequest->from_location_id;

        return $canRejectAsRequester || $canRejectAsFulfiller;
    }

    public function fulfill(User $user, InternalRequest $internalRequest): bool
    {
        if ($user->hasRole('admin')) return true;

        if (!$user->hasPermissionTo('fulfill.internal-requests')) return false;

        return $user->business_location_id === $internalRequest->from_location_id && $internalRequest->status === 'pending_fulfillment';
    }
}

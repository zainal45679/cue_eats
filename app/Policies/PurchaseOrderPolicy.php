<?php

namespace App\Policies;

use App\Models\PurchaseOrder;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PurchaseOrderPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('read.purchase-orders');
    }

    public function view(User $user, PurchaseOrder $purchaseOrder): bool
    {
        if ($user->hasRole('admin')) return true;
        
        if (!$user->hasPermissionTo('read.purchase-orders')) return false;

        return $user->business_location_id === $purchaseOrder->business_location_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create.purchase-orders');
    }

    public function update(User $user, PurchaseOrder $purchaseOrder): bool
    {
        if ($user->hasRole('admin')) return true;
        
        if (!$user->hasPermissionTo('update.purchase-orders')) return false;

        return $user->business_location_id === $purchaseOrder->business_location_id && in_array($purchaseOrder->status, ['draft', 'pending_approval']);
    }

    public function delete(User $user, PurchaseOrder $purchaseOrder): bool
    {
        if ($user->hasRole('admin')) return true;
        
        if (!$user->hasPermissionTo('delete.purchase-orders')) return false;

        return $user->business_location_id === $purchaseOrder->business_location_id && in_array($purchaseOrder->status, ['draft', 'pending_approval']);
    }

    public function approve(User $user, PurchaseOrder $purchaseOrder): bool
    {
        if ($user->hasRole('admin')) return true;
        
        if (!$user->hasPermissionTo('approve.purchase-orders')) return false;
        
        // They can only approve POs for their own location
        return $user->business_location_id === $purchaseOrder->business_location_id &&
               in_array($purchaseOrder->status, ['draft', 'pending_approval']);
    }

    public function reject(User $user, PurchaseOrder $purchaseOrder): bool
    {
        if ($user->hasRole('admin')) return true;
        
        if (!$user->hasPermissionTo('approve.purchase-orders')) return false;
        
        return $user->business_location_id === $purchaseOrder->business_location_id;
    }
}

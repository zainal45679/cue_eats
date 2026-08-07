<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UpdateManagerPermissions extends Command
{
    protected $signature = 'roles:update-manager';
    protected $description = 'Update manager role permissions';

    public function handle()
    {
        $managerRole = Role::where('name', 'Manager')->first();
        if (!$managerRole) {
            $this->error('Manager role not found.');
            return;
        }

        $allPermissions = Permission::pluck('name')->toArray();

        $managerPermissions = array_filter($allPermissions, function($perm) {
            // No global system config
            if (
                str_contains($perm, 'system') || 
                str_contains($perm, 'roles') || 
                str_contains($perm, 'users') || 
                str_contains($perm, 'approval-configurations') ||
                str_contains($perm, 'brands') ||
                str_contains($perm, 'countries') ||
                str_contains($perm, 'currency-tax') ||
                str_contains($perm, 'payment-terms') ||
                str_contains($perm, 'units-of-measure') ||
                str_contains($perm, 'ingredient-categories') ||
                str_contains($perm, 'suppliers') ||
                str_contains($perm, 'business-locations') ||
                str_contains($perm, 'storage-locations')
            ) {
                return false;
            }
            return true;
        });

        $managerRole->syncPermissions($managerPermissions);
        
        $this->info('Manager permissions updated successfully. Purchase Orders restricted, Live Stock (Inventory Balances) allowed.');
    }
}

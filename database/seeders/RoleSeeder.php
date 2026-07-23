<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure all permissions are generated based on EntityEnum
        $this->call(PermissionsSeeder::class);

        // 2. Define Roles
        $adminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $procurementRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'procurement_manager', 'guard_name' => 'web']);
        $outletManagerRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'outlet_manager', 'guard_name' => 'web']);
        $outletStaffRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'outlet_staff', 'guard_name' => 'web']);

        // 3. Admin: All permissions
        $adminRole->syncPermissions(\Spatie\Permission\Models\Permission::all());

        // 4. Procurement Manager: Full purchasing & central kitchen workflow
        $procurementPermissions = [
            'read.purchase-orders', 'create.purchase-orders', 'update.purchase-orders', 'delete.purchase-orders', 'approve.purchase-orders', 'receive.purchase-orders',
            'read.internal-requests', 'create.internal-requests', 'update.internal-requests', 'delete.internal-requests', 'approve.internal-requests', 'fulfill.internal-requests', 'receive.internal-requests',
            'read.suppliers', 'create.suppliers', 'update.suppliers', 'delete.suppliers',
            'read.ingredients', 'create.ingredients', 'update.ingredients', 'delete.ingredients',
            'read.brands', 'create.brands', 'update.brands', 'delete.brands',
            'read.ingredient-categories', 'create.ingredient-categories', 'update.ingredient-categories', 'delete.ingredient-categories',
        ];
        // Ensure these permissions exist (PermissionsSeeder generated them)
        $procurementRole->syncPermissions(\Spatie\Permission\Models\Permission::whereIn('name', $procurementPermissions)->get());

        // 5. Outlet Manager: Branch workflow (Approve PO, Approve IR, Receive)
        $managerPermissions = [
            'read.purchase-orders', 'create.purchase-orders', 'update.purchase-orders', 'delete.purchase-orders', 'approve.purchase-orders', 'receive.purchase-orders',
            'read.internal-requests', 'create.internal-requests', 'update.internal-requests', 'delete.internal-requests', 'approve.internal-requests', 'receive.internal-requests',
        ];
        $outletManagerRole->syncPermissions(\Spatie\Permission\Models\Permission::whereIn('name', $managerPermissions)->get());

        // 6. Outlet Staff: Branch workflow (Create PO, Create IR, Receive)
        $staffPermissions = [
            'read.purchase-orders', 'create.purchase-orders', 'update.purchase-orders', 'delete.purchase-orders', 'receive.purchase-orders',
            'read.internal-requests', 'create.internal-requests', 'update.internal-requests', 'delete.internal-requests', 'receive.internal-requests',
        ];
        $outletStaffRole->syncPermissions(\Spatie\Permission\Models\Permission::whereIn('name', $staffPermissions)->get());

        // 7. Seed Test Users
        $centralLocation = \App\Models\BusinessLocation::first();
        $branchLocation = \App\Models\BusinessLocation::skip(1)->first();

        if (!$centralLocation || !$branchLocation) {
            $this->command->error('Not enough business locations found. Cannot seed users.');
            return;
        }

        $admin = \App\Models\User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'System Admin', 'password' => \Illuminate\Support\Facades\Hash::make('password'), 'business_location_id' => $centralLocation->id]
        );
        $admin->syncRoles([$adminRole]);

        $procurement = \App\Models\User::firstOrCreate(
            ['email' => 'procurement@example.com'],
            ['name' => 'Procurement Manager', 'password' => \Illuminate\Support\Facades\Hash::make('password'), 'business_location_id' => $centralLocation->id]
        );
        $procurement->syncRoles([$procurementRole]);

        $manager = \App\Models\User::firstOrCreate(
            ['email' => 'manager@example.com'],
            ['name' => 'Branch 1 Manager', 'password' => \Illuminate\Support\Facades\Hash::make('password'), 'business_location_id' => $branchLocation->id]
        );
        $manager->syncRoles([$outletManagerRole]);

        $staff = \App\Models\User::firstOrCreate(
            ['email' => 'staff@example.com'],
            ['name' => 'Branch 1 Staff', 'password' => \Illuminate\Support\Facades\Hash::make('password'), 'business_location_id' => $branchLocation->id]
        );
        $staff->syncRoles([$outletStaffRole]);

        $this->command->info('Comprehensive RBAC and test users seeded successfully.');
    }
}

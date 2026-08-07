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
        $adminRole = \App\Models\Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $procurementRole = \App\Models\Role::firstOrCreate(['name' => 'procurement_manager', 'guard_name' => 'web']);
        $outletManagerRole = \App\Models\Role::firstOrCreate(['name' => 'outlet_manager', 'guard_name' => 'web']);
        $outletStaffRole = \App\Models\Role::firstOrCreate(['name' => 'outlet_staff', 'guard_name' => 'web']);

        // 3. Admin: All permissions
        $adminRole->syncPermissions(\App\Models\Permission::all());

        // 4. Procurement Manager: Full purchasing & central kitchen workflow
        $procurementPermissions = [
            'read.inventory-balances',
            'read.purchase-orders', 'create.purchase-orders', 'update.purchase-orders', 'delete.purchase-orders', 'approve.purchase-orders', 'receive.purchase-orders',
            'read.internal-requests', 'create.internal-requests', 'update.internal-requests', 'delete.internal-requests', 'approve.internal-requests', 'fulfill.internal-requests', 'receive.internal-requests',
            'read.suppliers', 'create.suppliers', 'update.suppliers', 'delete.suppliers',
            'read.ingredients', 'create.ingredients', 'update.ingredients', 'delete.ingredients',
            'read.brands', 'create.brands', 'update.brands', 'delete.brands',
            'read.ingredient-categories', 'create.ingredient-categories', 'update.ingredient-categories', 'delete.ingredient-categories',
        ];
        // Ensure these permissions exist (PermissionsSeeder generated them)
        $procurementRole->syncPermissions(\App\Models\Permission::whereIn('name', $procurementPermissions)->get());

        // 5. Outlet Manager: Branch workflow (Approve PO, Approve IR, Receive)
        $managerPermissions = [
            'read.inventory-balances',
            'read.purchase-orders', 'create.purchase-orders', 'update.purchase-orders', 'delete.purchase-orders', 'approve.purchase-orders', 'receive.purchase-orders',
            'read.internal-requests', 'create.internal-requests', 'update.internal-requests', 'delete.internal-requests', 'approve.internal-requests', 'receive.internal-requests',
        ];
        $outletManagerRole->syncPermissions(\App\Models\Permission::whereIn('name', $managerPermissions)->get());

        // 6. Outlet Staff: Branch workflow (Create PO, Create IR, Receive)
        $staffPermissions = [
            'read.inventory-balances',
            'read.purchase-orders', 'create.purchase-orders', 'update.purchase-orders', 'delete.purchase-orders', 'receive.purchase-orders',
            'read.internal-requests', 'create.internal-requests', 'update.internal-requests', 'delete.internal-requests', 'receive.internal-requests',
        ];
        $outletStaffRole->syncPermissions(\App\Models\Permission::whereIn('name', $staffPermissions)->get());

        // 7. Seed Test Users
        $outlets = \App\Models\BusinessLocation::where('is_parent_location', false)->take(3)->get();
        
        if ($outlets->count() < 3) {
            $this->command->warn('Not enough outlets found. Falling back to any business locations.');
            $outlets = \App\Models\BusinessLocation::take(3)->get();
        }

        $admin = \App\Models\User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'System Admin', 'password' => \Illuminate\Support\Facades\Hash::make('password')]
        );
        $admin->syncRoles([$adminRole]);

        $procurement = \App\Models\User::firstOrCreate(
            ['email' => 'procurement@example.com'],
            ['name' => 'Procurement Manager', 'password' => \Illuminate\Support\Facades\Hash::make('password')]
        );
        $procurement->syncRoles([$procurementRole]);

        if (isset($outlets[0])) {
            $manager = \App\Models\User::firstOrCreate(
                ['email' => 'manager@example.com'],
                ['name' => 'Branch 1 Manager', 'password' => \Illuminate\Support\Facades\Hash::make('password'), 'business_location_id' => $outlets[0]->id]
            );
            $manager->syncRoles([$outletManagerRole]);
        }

        if (isset($outlets[1])) {
            $manager2 = \App\Models\User::firstOrCreate(
                ['email' => 'manager2@example.com'],
                ['name' => 'Branch 2 Manager', 'password' => \Illuminate\Support\Facades\Hash::make('password'), 'business_location_id' => $outlets[1]->id]
            );
            $manager2->syncRoles([$outletManagerRole]);
        }

        if (isset($outlets[2])) {
            $manager3 = \App\Models\User::firstOrCreate(
                ['email' => 'manager3@example.com'],
                ['name' => 'Branch 3 Manager', 'password' => \Illuminate\Support\Facades\Hash::make('password'), 'business_location_id' => $outlets[2]->id]
            );
            $manager3->syncRoles([$outletManagerRole]);
        }

        $this->command->info('Comprehensive RBAC and test users seeded successfully.');
    }
}

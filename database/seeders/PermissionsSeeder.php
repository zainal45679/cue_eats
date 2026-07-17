<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\PermissionEnum;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

final class PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = PermissionEnum::all();

        Permission::whereNotIn('name', $permissions)->delete();

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        $adminRole = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web',
        ]);

        $adminRole->syncPermissions($permissions);

        $user = User::where('email', env('DEFAULT_USER_EMAIL'))->first();

        if ($user) {
            $user->assignRole($adminRole);
            $this->command->info("Admin role assigned to user: {$user->name} ({$user->email})");
        } else {
            $this->command->info('Admin user not found. Please run AdminUserSeeder first.');
        }

        $this->command->info('Admin role created with '.count($permissions).' permissions.');
        $this->command->info('Permissions assigned: '.implode(', ', $permissions));
    }
}

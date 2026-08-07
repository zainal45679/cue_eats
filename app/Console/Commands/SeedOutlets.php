<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BusinessLocation;
use App\Models\StorageLocation;
use App\Models\User;
use App\Models\Ingredient;
use App\Models\InventoryBalance;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SeedOutlets extends Command
{
    protected $signature = 'seed:outlets';
    protected $description = 'Seed 3 outlets, meaningful roles/users, and varied inventory.';

    public function handle()
    {
        $this->info('Starting outlet seeding...');

        // 1. Roles
        $roles = ['Admin', 'Manager', 'Cashier', 'Kitchen Staff'];
        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }
        
        $outlets = [
            ['name' => 'Downtown Branch', 'prefix' => 'downtown', 'code' => 'DTB01'],
            ['name' => 'Uptown Branch', 'prefix' => 'uptown', 'code' => 'UTB01'],
            ['name' => 'Suburban Branch', 'prefix' => 'suburban', 'code' => 'SUB01'],
        ];

        $ingredients = Ingredient::all();

        foreach ($outlets as $data) {
            // Create Business Location
            $location = BusinessLocation::firstOrCreate(
                ['location_code' => $data['code']],
                [
                    'country_id' => 1,
                    'location_name' => $data['name'],
                    'location_type' => 'Store',
                    'is_inventory_location' => true,
                    'is_sales_enabled' => true,
                    'status' => 1
                ]
            );

            // Create Storage Location
            $storage = StorageLocation::firstOrCreate(
                ['business_location_id' => $location->id, 'storage_name' => $data['name'] . ' Main Storage'],
                ['storage_type' => 'Main', 'status' => 1]
            );

            // Create Users
            $locSlug = $data['prefix'];
            $usersData = [
                ['role' => 'Manager', 'name' => $data['name'] . ' Manager', 'email' => $index === 0 ? 'manager@example.com' : 'manager' . ($index + 1) . '@example.com'],
                ['role' => 'Cashier', 'name' => $data['name'] . ' Cashier', 'email' => 'cashier_' . $locSlug . '@example.com'],
                ['role' => 'Kitchen Staff', 'name' => $data['name'] . ' Kitchen', 'email' => 'kitchen_' . $locSlug . '@example.com'],
            ];

            foreach ($usersData as $u) {
                $user = User::firstOrCreate(
                    ['email' => $u['email']],
                    [
                        'name' => $u['name'],
                        'password' => Hash::make('password'),
                        'business_location_id' => $location->id,
                        'status' => 1,
                        'uuid' => (string) Str::uuid()
                    ]
                );
                
                if (!$user->hasRole($u['role'])) {
                    $user->assignRole($u['role']);
                }
            }

            // Seed inventory
            $this->info("Seeding inventory for {$data['name']}...");
            foreach ($ingredients as $ingredient) {
                $qty = match($data['prefix']) {
                    'downtown' => rand(500, 2000), 
                    'uptown' => rand(200, 1000),   
                    'suburban' => rand(50, 300),  
                    default => 500
                };
                
                InventoryBalance::updateOrCreate(
                    ['ingredient_id' => $ingredient->id, 'storage_location_id' => $storage->id],
                    ['available_qty' => $qty, 'reserved_qty' => 0, 'on_order_qty' => 0]
                );
            }
        }

        $this->info('Successfully seeded outlets, users, roles, and varied stock!');
    }
}

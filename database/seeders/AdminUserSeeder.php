<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

final class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate([
            'email' => env('DEFAULT_USER_EMAIL', 'admin@admin.com'),
        ], [
            'name' => 'Admin',
            'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'password')),
        ]);
    }
}

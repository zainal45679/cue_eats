<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Organization;

class OrganizationSeeder extends Seeder
{
    public function run(): void
    {
        Organization::firstOrCreate(
            ['code' => 'ORG-CUE'],
            [
                'name' => 'Cue Eats HQ',
                'theme_color' => '#FF5733',
                'status' => true,
            ]
        );
    }
}

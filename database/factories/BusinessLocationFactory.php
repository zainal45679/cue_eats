<?php

namespace Database\Factories;

use App\Models\BusinessLocation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BusinessLocation>
 */
class BusinessLocationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'country_id' => \App\Models\Country::factory(),
            'location_name' => fake()->company(),
            'location_code' => fake()->lexify('LOC-????'),
            'location_type' => 'Store',
            'is_parent_location' => false,
            'is_inventory_location' => true,
            'is_purchasing_enabled' => true,
            'is_sales_enabled' => true,
            'status' => 1,
        ];
    }
}

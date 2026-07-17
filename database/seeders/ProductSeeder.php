<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

final class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = ['bottles', 'dispensers'];
        $types = ['returnable', 'disposable'];

        for ($i = 1; $i <= 100; $i++) {
            Product::create([
                'name' => 'Bottle '.$i,
                'type' => $types[array_rand($types)],
                'category' => $categories[array_rand($categories)],
                'image' => null,
                'litres' => random_int(1, 20),
                'created_by' => 1,
                'updated_by' => 1,
            ]);
        }
    }
}

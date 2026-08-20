<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Supplier;
use App\Models\Ingredient;
use App\Models\IngredientSupplier;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create or Update Specialized Suppliers
        $suppliers = [
            'meat' => Supplier::updateOrCreate(['name' => 'Prime Cut Meats & Poultry'], [
                'contact_name' => 'Marcus Vance',
                'email' => 'sales@primecutmeats.com',
                'phone' => '+1-555-0144',
                'address' => '102 Industrial Meat Way, Chicago, IL',
                'tax_number' => 'TX-994821',
                'status' => true,
            ]),
            'dairy' => Supplier::updateOrCreate(['name' => 'Apex Dairy & Creamery'], [
                'contact_name' => 'Sarah Jenkins',
                'email' => 'orders@apexdairy.com',
                'phone' => '+1-555-0155',
                'address' => '405 Milk Valley Road, Madison, WI',
                'tax_number' => 'TX-883712',
                'status' => true,
            ]),
            'produce' => Supplier::updateOrCreate(['name' => 'Valley Produce & Fresh Herbs'], [
                'contact_name' => 'Carlos Mendez',
                'email' => 'supplies@valleyproduce.com',
                'phone' => '+1-555-0166',
                'address' => '78 Farmhouse Drive, Salinas, CA',
                'tax_number' => 'TX-772601',
                'status' => true,
            ]),
            'bakery' => Supplier::updateOrCreate(['name' => 'Golden Grain Artisan Bakery'], [
                'contact_name' => 'Elena Rostova',
                'email' => 'contact@goldengrainbakery.com',
                'phone' => '+1-555-0177',
                'address' => '12 Flour Mill Lane, Minneapolis, MN',
                'tax_number' => 'TX-661590',
                'status' => true,
            ]),
            'pantry' => Supplier::updateOrCreate(['name' => 'Gourmet Pantry & Imports'], [
                'contact_name' => 'Arthur Pendelton',
                'email' => 'info@gourmetpantry.com',
                'phone' => '+1-555-0188',
                'address' => '500 Spice Market Blvd, Jersey City, NJ',
                'tax_number' => 'TX-550489',
                'status' => true,
            ]),
            'frozen' => Supplier::updateOrCreate(['name' => 'FrostByte Frozen Logistics'], [
                'contact_name' => 'Kevin Zhang',
                'email' => 'dispatch@frostbytefrozen.com',
                'phone' => '+1-555-0199',
                'address' => '88 Cold Storage Way, Omaha, NE',
                'tax_number' => 'TX-449378',
                'status' => true,
            ]),
            'beverage' => Supplier::updateOrCreate(['name' => 'Refresh Beverage Distributors'], [
                'contact_name' => 'Rachel Adams',
                'email' => 'sales@refreshbeverage.com',
                'phone' => '+1-555-0211',
                'address' => '300 Fountain Spring Rd, Atlanta, GA',
                'tax_number' => 'TX-338267',
                'status' => true,
            ]),
            'general' => Supplier::updateOrCreate(['name' => 'Fresh Foods Co'], [
                'contact_name' => 'General Sales Desk',
                'email' => 'fresh@example.com',
                'phone' => '+1-555-0100',
                'address' => '15 Wholesale Ave, Dallas, TX',
                'tax_number' => 'TX-100200',
                'status' => true,
            ]),
            'farms' => Supplier::updateOrCreate(['name' => 'Fresh Farms'], [
                'contact_name' => 'Farm Manager',
                'email' => 'orders@freshfarms.com',
                'phone' => '+1-555-0101',
                'address' => '1 Countryside Way, Fresno, CA',
                'tax_number' => 'TX-100201',
                'status' => true,
            ]),
        ];

        // 2. Map Every Ingredient to Suppliers
        $allIngredients = Ingredient::with(['category', 'baseUom'])->get();

        foreach ($allIngredients as $ing) {
            $catName = strtolower($ing->category?->name ?? 'general');
            
            // Determine primary specialized supplier based on category
            $primarySupplierKey = 'general';
            if (str_contains($catName, 'meat')) {
                $primarySupplierKey = 'meat';
            } elseif (str_contains($catName, 'dairy')) {
                $primarySupplierKey = 'dairy';
            } elseif (str_contains($catName, 'produce')) {
                $primarySupplierKey = 'produce';
            } elseif (str_contains($catName, 'bakery')) {
                $primarySupplierKey = 'bakery';
            } elseif (str_contains($catName, 'pantry')) {
                $primarySupplierKey = 'pantry';
            } elseif (str_contains($catName, 'frozen')) {
                $primarySupplierKey = 'frozen';
            } elseif (str_contains($catName, 'beverage')) {
                $primarySupplierKey = 'beverage';
            }

            $primarySupplier = $suppliers[$primarySupplierKey];

            // Item-specific realistic wholesale pricing (overriding generic category defaults)
            $itemPrices = [
                'BEEF-01' => 1.35,  // $1.35 per 150g beef patty (EA)
                'BUN-01'  => 0.40,  // $0.40 per burger bun (EA)
                'CHS-AM'  => 0.20,  // $0.20 per American cheese slice (EA)
                'CHS-SW'  => 0.20,  // $0.20 per Swiss cheese slice (EA)
                'CHS-PJ'  => 0.22,  // $0.22 per Pepper Jack cheese slice (EA)
                'FRZ-ONR' => 0.18,  // $0.18 per beer-battered onion ring (EA)
                'FRZ-MST' => 0.40,  // $0.40 per mozzarella stick (EA)
                'PRO-ON'  => 1.50,  // $1.50 per kg red onions
                'PAN-PKL' => 2.20,  // $2.20 per kg pickles
                'PRO-MSH' => 4.50,  // $4.50 per kg wild mushrooms
                'PRO-ARG' => 3.50,  // $3.50 per kg arugula
                'PAN-TAI' => 6.50,  // $6.50 per L truffle aioli
                'PRO-JAL' => 2.50,  // $2.50 per kg jalapenos
                'PAN-HBM' => 4.20,  // $4.20 per L habanero mayo
                'BKT-PZD' => 0.60,  // $0.60 per pizza dough portion (EA)
                'FRZ-FRS' => 2.50,  // $2.50 per kg shoestring fries
                'BEV-CRB' => 0.30,  // $0.30 per L carbonated water
            ];

            $wholesalePrice = $itemPrices[$ing->code] ?? match ($primarySupplierKey) {
                'meat' => 8.50,
                'dairy' => 4.20,
                'produce' => 2.50,
                'bakery' => 1.80,
                'pantry' => 3.60,
                'frozen' => 5.00,
                'beverage' => 2.90,
                default => 3.00,
            };

            // Map Primary (Preferred) Supplier
            IngredientSupplier::updateOrCreate([
                'ingredient_id' => $ing->id,
                'supplier_id' => $primarySupplier->id,
            ], [
                'purchase_uom_id' => $ing->base_uom_id,
                'moq' => 10.00,
                'price' => $wholesalePrice,
                'lead_time_days' => 2,
                'is_preferred' => true,
                'status' => true,
            ]);

            // Map Secondary Backup Supplier (Fresh Foods Co or Fresh Farms)
            $secondarySupplier = ($primarySupplierKey === 'produce') ? $suppliers['farms'] : $suppliers['general'];
            if ($secondarySupplier->id !== $primarySupplier->id) {
                IngredientSupplier::updateOrCreate([
                    'ingredient_id' => $ing->id,
                    'supplier_id' => $secondarySupplier->id,
                ], [
                    'purchase_uom_id' => $ing->base_uom_id,
                    'moq' => 5.00,
                    'price' => round($wholesalePrice * 1.08, 2),
                    'lead_time_days' => 3,
                    'is_preferred' => false,
                    'status' => true,
                ]);
            }
        }
    }
}

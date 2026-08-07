<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ingredient;
use App\Models\UnitOfMeasure;
use App\Models\MenuItem;
use App\Models\RecipeItem;
use App\Models\Modifier;

class RecipeSeeder extends Seeder
{
    public function run()
    {
        $uomEA = UnitOfMeasure::where('code', 'EA')->first();
        $uomKG = UnitOfMeasure::where('code', 'KG')->first();
        $uomL = UnitOfMeasure::where('code', 'L')->first();

        if (!$uomEA || !$uomKG || !$uomL) {
            throw new \Exception('UOMs missing, please run DummyInventorySeeder first.');
        }

        // Get ingredients by code
        $ing = [];
        foreach (Ingredient::all() as $ingredient) {
            $ing[$ingredient->code] = $ingredient;
        }

        // Logical mappings (Menu Item Name => Ingredients array)
        $recipes = [
            'The Classic Smash' => [
                ['ingredient' => $ing['BUN-01'], 'qty' => 1, 'uom' => $uomEA],
                ['ingredient' => $ing['BEEF-01'], 'qty' => 2, 'uom' => $uomEA],
                ['ingredient' => $ing['CHS-AM'], 'qty' => 2, 'uom' => $uomEA],
                ['ingredient' => $ing['PRO-ON'], 'qty' => 0.05, 'uom' => $uomKG],
                ['ingredient' => $ing['PAN-PKL'], 'qty' => 0.03, 'uom' => $uomKG],
            ],
            'Truffle Mushroom Burger' => [
                ['ingredient' => $ing['BUN-01'], 'qty' => 1, 'uom' => $uomEA],
                ['ingredient' => $ing['BEEF-01'], 'qty' => 1, 'uom' => $uomEA],
                ['ingredient' => $ing['CHS-SW'], 'qty' => 1, 'uom' => $uomEA],
                ['ingredient' => $ing['PRO-MSH'], 'qty' => 0.1, 'uom' => $uomKG],
                ['ingredient' => $ing['PAN-TAI'], 'qty' => 0.02, 'uom' => $uomL],
                ['ingredient' => $ing['PRO-ARG'], 'qty' => 0.05, 'uom' => $uomKG],
            ],
            'Spicy Inferno Burger' => [
                ['ingredient' => $ing['BUN-01'], 'qty' => 1, 'uom' => $uomEA],
                ['ingredient' => $ing['BEEF-01'], 'qty' => 1, 'uom' => $uomEA],
                ['ingredient' => $ing['CHS-PJ'], 'qty' => 1, 'uom' => $uomEA],
                ['ingredient' => $ing['PRO-JAL'], 'qty' => 0.05, 'uom' => $uomKG],
                ['ingredient' => $ing['PAN-HBM'], 'qty' => 0.02, 'uom' => $uomL],
                ['ingredient' => $ing['FRZ-ONR'], 'qty' => 2, 'uom' => $uomEA],
            ],
            'Classic Margherita' => [
                ['ingredient' => $ing['BKT-PZD'], 'qty' => 1, 'uom' => $uomEA],
                ['ingredient' => $ing['PAN-TMS'], 'qty' => 0.15, 'uom' => $uomL],
                ['ingredient' => $ing['CHS-FMZ'], 'qty' => 0.2, 'uom' => $uomKG],
                ['ingredient' => $ing['PRO-BSL'], 'qty' => 0.02, 'uom' => $uomKG],
            ],
            'Pepperoni Feast' => [
                ['ingredient' => $ing['BKT-PZD'], 'qty' => 1, 'uom' => $uomEA],
                ['ingredient' => $ing['PAN-TMS'], 'qty' => 0.15, 'uom' => $uomL],
                ['ingredient' => $ing['CHS-SMZ'], 'qty' => 0.25, 'uom' => $uomKG],
                ['ingredient' => $ing['MET-PEP'], 'qty' => 0.1, 'uom' => $uomKG],
                ['ingredient' => $ing['PAN-HNY'], 'qty' => 0.02, 'uom' => $uomL],
            ],
            'BBQ Chicken Pizza' => [
                ['ingredient' => $ing['BKT-PZD'], 'qty' => 1, 'uom' => $uomEA],
                ['ingredient' => $ing['PAN-BBQ'], 'qty' => 0.15, 'uom' => $uomL],
                ['ingredient' => $ing['CHS-SMZ'], 'qty' => 0.2, 'uom' => $uomKG],
                ['ingredient' => $ing['MET-CHK'], 'qty' => 0.15, 'uom' => $uomKG],
                ['ingredient' => $ing['PRO-ON'], 'qty' => 0.05, 'uom' => $uomKG],
                ['ingredient' => $ing['PRO-CIL'], 'qty' => 0.01, 'uom' => $uomKG],
            ],
            'Truffle Parmesan Fries' => [
                ['ingredient' => $ing['FRZ-FRS'], 'qty' => 0.25, 'uom' => $uomKG],
                ['ingredient' => $ing['PAN-TRO'], 'qty' => 0.01, 'uom' => $uomL],
                ['ingredient' => $ing['CHS-PRM'], 'qty' => 0.03, 'uom' => $uomKG],
                ['ingredient' => $ing['PRO-PAR'], 'qty' => 0.01, 'uom' => $uomKG],
            ],
            'Crispy Mozzarella Sticks' => [
                ['ingredient' => $ing['FRZ-MST'], 'qty' => 6, 'uom' => $uomEA],
                ['ingredient' => $ing['PAN-MAR'], 'qty' => 0.05, 'uom' => $uomL],
            ],
            'Onion Rings' => [
                ['ingredient' => $ing['FRZ-ONR'], 'qty' => 10, 'uom' => $uomEA],
            ],
            'Craft Cola' => [
                ['ingredient' => $ing['BEV-COL'], 'qty' => 0.05, 'uom' => $uomL],
                ['ingredient' => $ing['BEV-CRB'], 'qty' => 0.45, 'uom' => $uomL],
            ],
            'Fresh Lemonade' => [
                ['ingredient' => $ing['PRO-LMJ'], 'qty' => 0.05, 'uom' => $uomL],
                ['ingredient' => $ing['PAN-SGR'], 'qty' => 0.02, 'uom' => $uomKG],
                ['ingredient' => $ing['BEV-STP'], 'qty' => 0.03, 'uom' => $uomL],
            ]
        ];

        foreach (MenuItem::all() as $menuItem) {
            if (isset($recipes[$menuItem->name])) {
                foreach ($recipes[$menuItem->name] as $itemRecipe) {
                    RecipeItem::updateOrCreate([
                        'menu_item_id' => $menuItem->id,
                        'ingredient_id' => $itemRecipe['ingredient']->id,
                    ], [
                        'quantity' => $itemRecipe['qty'],
                        'uom_id' => $itemRecipe['uom']->id
                    ]);
                }
            }
        }

        // Modifiers mappings
        $modifierRecipes = [
            'Extra Cheese' => [['ingredient' => $ing['CHS-AM'], 'qty' => 1, 'uom' => $uomEA]],
            'Crispy Bacon' => [['ingredient' => $ing['MET-PEP'], 'qty' => 0.05, 'uom' => $uomKG]], // dummy bacon
            'Avocado' => [['ingredient' => $ing['PRO-ARG'], 'qty' => 0.05, 'uom' => $uomKG]], // dummy
            'Cheese Stuffed Crust' => [['ingredient' => $ing['CHS-SMZ'], 'qty' => 0.1, 'uom' => $uomKG]],
            'Large 14"' => [['ingredient' => $ing['BKT-PZD'], 'qty' => 0.5, 'uom' => $uomEA]],
            'Family 18"' => [['ingredient' => $ing['BKT-PZD'], 'qty' => 1, 'uom' => $uomEA]],
            'Large (24oz)' => [['ingredient' => $ing['BEV-CRB'], 'qty' => 0.25, 'uom' => $uomL]],
            'Ranch' => [['ingredient' => $ing['PAN-HBM'], 'qty' => 0.05, 'uom' => $uomL]], // dummy
            'Spicy Mayo' => [['ingredient' => $ing['PAN-HBM'], 'qty' => 0.05, 'uom' => $uomL]],
            'Truffle Aioli' => [['ingredient' => $ing['PAN-TAI'], 'qty' => 0.05, 'uom' => $uomL]],
        ];

        foreach (Modifier::all() as $modifier) {
            if (isset($modifierRecipes[$modifier->name])) {
                foreach ($modifierRecipes[$modifier->name] as $modRecipe) {
                    RecipeItem::updateOrCreate([
                        'modifier_id' => $modifier->id,
                        'ingredient_id' => $modRecipe['ingredient']->id,
                    ], [
                        'quantity' => $modRecipe['qty'],
                        'uom_id' => $modRecipe['uom']->id
                    ]);
                }
            }
        }
    }
}


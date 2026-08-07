<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Ingredient;
use App\Models\IngredientCategory;
use App\Models\UnitOfMeasure;
use App\Models\MenuItem;
use App\Models\RecipeItem;
use App\Models\InventoryBalance;
use App\Models\BusinessLocation;
use App\Models\StorageLocation;
use Illuminate\Support\Facades\DB;

class SeedMeaningfulIngredients extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seed:meaningful-ingredients';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seeds meaningful ingredients and recipes for existing menu items';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        RecipeItem::truncate();

        $businessLoc = BusinessLocation::first();
        $storageLoc = StorageLocation::where('business_location_id', $businessLoc->id)->first();

        // Units
        $uomEach = UnitOfMeasure::firstOrCreate(['code' => 'EA'], ['name' => 'Each', 'type' => 'Unit', 'status' => true]);
        $uomGram = UnitOfMeasure::firstOrCreate(['code' => 'G'], ['name' => 'Gram', 'type' => 'Weight', 'status' => true]);
        $uomMl = UnitOfMeasure::firstOrCreate(['code' => 'ML'], ['name' => 'Milliliter', 'type' => 'Volume', 'status' => true]);

        // Categories
        $catMeat = IngredientCategory::firstOrCreate(['name' => 'Meat'], ['status' => true]);
        $catBakery = IngredientCategory::firstOrCreate(['name' => 'Bakery'], ['status' => true]);
        $catDairy = IngredientCategory::firstOrCreate(['name' => 'Dairy'], ['status' => true]);
        $catProduce = IngredientCategory::firstOrCreate(['name' => 'Produce'], ['status' => true]);
        $catPantry = IngredientCategory::firstOrCreate(['name' => 'Pantry & Sauces'], ['status' => true]);
        $catBev = IngredientCategory::firstOrCreate(['name' => 'Beverages'], ['status' => true]);

        // Ingredients Definition Helper
        $ingredientsMap = [];
        $addIng = function($name, $catId, $uomId) use (&$ingredientsMap, $storageLoc) {
            $ing = Ingredient::firstOrCreate(
                ['name' => $name],
                [
                    'code' => strtoupper(substr(str_replace(' ', '', $name), 0, 6)) . rand(10, 99),
                    'ingredient_category_id' => $catId,
                    'base_uom_id' => $uomId,
                    'is_inventory_item' => true,
                    'is_recipe_item' => true,
                    'status' => true
                ]
            );
            
            // Add 10,000 balance
            $bal = InventoryBalance::firstOrCreate(
                ['ingredient_id' => $ing->id, 'storage_location_id' => $storageLoc->id],
                ['available_qty' => 10000, 'reserved_qty' => 0, 'on_order_qty' => 0]
            );
            if ($bal->available_qty < 100) {
                $bal->update(['available_qty' => 10000]);
            }
            
            $ingredientsMap[$name] = $ing;
            return $ing;
        };

        // Create Ingredients
        $addIng('Beef Patty (150g)', $catMeat->id, $uomEach->id);
        $addIng('Brioche Bun', $catBakery->id, $uomEach->id);
        $addIng('Cheddar Slice', $catDairy->id, $uomEach->id);
        $addIng('Lettuce', $catProduce->id, $uomGram->id);
        $addIng('Tomato', $catProduce->id, $uomGram->id);
        $addIng('Red Onion', $catProduce->id, $uomGram->id);

        $addIng('Truffle Mayo', $catPantry->id, $uomGram->id);
        $addIng('Sautéed Mushrooms', $catProduce->id, $uomGram->id);
        $addIng('Spicy Mayo', $catPantry->id, $uomGram->id);
        $addIng('Jalapenos', $catProduce->id, $uomGram->id);

        $addIng('Pizza Dough (250g)', $catBakery->id, $uomEach->id);
        $addIng('Pizza Sauce', $catPantry->id, $uomGram->id);
        $addIng('Mozzarella Cheese', $catDairy->id, $uomGram->id);
        $addIng('Fresh Basil', $catProduce->id, $uomGram->id);
        $addIng('Pepperoni Slices', $catMeat->id, $uomGram->id);
        $addIng('BBQ Sauce', $catPantry->id, $uomGram->id);
        $addIng('Grilled Chicken', $catMeat->id, $uomGram->id);

        $addIng('French Fries', $catProduce->id, $uomGram->id);
        $addIng('Truffle Oil', $catPantry->id, $uomMl->id);
        $addIng('Parmesan Cheese', $catDairy->id, $uomGram->id);

        $addIng('Mozzarella Sticks', $catDairy->id, $uomEach->id);
        $addIng('Marinara Sauce', $catPantry->id, $uomGram->id);
        $addIng('Onion Rings', $catProduce->id, $uomGram->id);
        $addIng('Chicken Popcorn', $catMeat->id, $uomGram->id);

        $addIng('Cola Syrup', $catBev->id, $uomMl->id);
        $addIng('Soda Water', $catBev->id, $uomMl->id);
        $addIng('Lemon', $catProduce->id, $uomEach->id);
        $addIng('Sugar Syrup', $catPantry->id, $uomMl->id);
        $addIng('Ice', $catProduce->id, $uomGram->id);

        // Recipes Mapping Helper
        $mapRecipe = function($itemName, $recipeItems) use (&$ingredientsMap) {
            $menuItem = MenuItem::where('name', 'LIKE', "%$itemName%")->first();
            if (!$menuItem) return;
            
            foreach ($recipeItems as $ingName => $qty) {
                if (!isset($ingredientsMap[$ingName])) continue;
                $ing = $ingredientsMap[$ingName];
                RecipeItem::create([
                    'menu_item_id' => $menuItem->id,
                    'ingredient_id' => $ing->id,
                    'quantity' => $qty,
                    'uom_id' => $ing->base_uom_id
                ]);
            }
        };

        // 1. The Classic Smash (Testing)
        $mapRecipe('Classic Smash', [
            'Beef Patty (150g)' => 2,
            'Brioche Bun' => 1,
            'Cheddar Slice' => 2,
            'Lettuce' => 20,
            'Tomato' => 30,
            'Red Onion' => 10,
        ]);

        // 2. Truffle Mushroom Burger
        $mapRecipe('Truffle Mushroom Burger', [
            'Beef Patty (150g)' => 1,
            'Brioche Bun' => 1,
            'Cheddar Slice' => 1,
            'Sautéed Mushrooms' => 50,
            'Truffle Mayo' => 25,
        ]);

        // 3. Spicy Inferno Burger
        $mapRecipe('Spicy Inferno Burger', [
            'Beef Patty (150g)' => 1,
            'Brioche Bun' => 1,
            'Cheddar Slice' => 1,
            'Spicy Mayo' => 30,
            'Jalapenos' => 20,
            'Lettuce' => 20,
        ]);

        // 4. Classic Margherita
        $mapRecipe('Classic Margherita', [
            'Pizza Dough (250g)' => 1,
            'Pizza Sauce' => 80,
            'Mozzarella Cheese' => 120,
            'Fresh Basil' => 10,
        ]);

        // 5. Pepperoni Feast
        $mapRecipe('Pepperoni Feast', [
            'Pizza Dough (250g)' => 1,
            'Pizza Sauce' => 80,
            'Mozzarella Cheese' => 140,
            'Pepperoni Slices' => 60,
        ]);

        // 6. BBQ Chicken Pizza
        $mapRecipe('BBQ Chicken Pizza', [
            'Pizza Dough (250g)' => 1,
            'BBQ Sauce' => 80,
            'Mozzarella Cheese' => 120,
            'Grilled Chicken' => 100,
            'Red Onion' => 30,
        ]);

        // 7. Truffle Parmesan Fries
        $mapRecipe('Truffle Parmesan Fries', [
            'French Fries' => 200,
            'Truffle Oil' => 10,
            'Parmesan Cheese' => 20,
        ]);

        // 8. Crispy Mozzarella Sticks
        $mapRecipe('Crispy Mozzarella Sticks', [
            'Mozzarella Sticks' => 6,
            'Marinara Sauce' => 50,
        ]);

        // 9. Onion Rings
        $mapRecipe('Onion Rings', [
            'Onion Rings' => 150,
            'Spicy Mayo' => 40,
        ]);

        // 10. Craft Cola
        $mapRecipe('Craft Cola', [
            'Cola Syrup' => 30,
            'Soda Water' => 250,
            'Ice' => 150,
        ]);

        // 11. Fresh Lemonade
        $mapRecipe('Fresh Lemonade', [
            'Lemon' => 1,
            'Sugar Syrup' => 40,
            'Soda Water' => 200,
            'Ice' => 150,
        ]);

        // 12. Chicken popcorns
        $mapRecipe('Chicken popcorns', [
            'Chicken Popcorn' => 200,
            'Spicy Mayo' => 30,
        ]);

        // Add ingredients to any existing Modifiers
        $modifiers = \App\Models\Modifier::all();
        foreach ($modifiers as $mod) {
            if (stripos($mod->name, 'cheese') !== false) {
                RecipeItem::create(['modifier_id' => $mod->id, 'ingredient_id' => $ingredientsMap['Cheddar Slice']->id, 'quantity' => 1, 'uom_id' => $uomEach->id]);
            } elseif (stripos($mod->name, 'patty') !== false || stripos($mod->name, 'beef') !== false) {
                RecipeItem::create(['modifier_id' => $mod->id, 'ingredient_id' => $ingredientsMap['Beef Patty (150g)']->id, 'quantity' => 1, 'uom_id' => $uomEach->id]);
            } else {
                RecipeItem::create(['modifier_id' => $mod->id, 'ingredient_id' => $ingredientsMap['Lettuce']->id, 'quantity' => 10, 'uom_id' => $uomGram->id]);
            }
        }

        $this->info("Meaningful recipes and ingredients created successfully!");
    }
}

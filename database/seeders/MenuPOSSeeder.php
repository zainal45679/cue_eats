<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\ModifierGroup;
use App\Models\Modifier;
use Illuminate\Support\Facades\DB;

class MenuPOSSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data to avoid duplicates if run multiple times
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('menu_item_modifier_group')->truncate();
        MenuItem::truncate();
        Modifier::truncate();
        ModifierGroup::truncate();
        MenuCategory::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. Create Categories
        $catBurgers = MenuCategory::create(['name' => 'Signature Burgers', 'description' => '100% Angus beef, smashed to perfection.']);
        $catPizzas = MenuCategory::create(['name' => 'Wood-Fired Pizzas', 'description' => 'Authentic Neapolitan style pizzas.']);
        $catSides = MenuCategory::create(['name' => 'Sides & Shareables', 'description' => 'Perfect additions to any meal.']);
        $catBeverages = MenuCategory::create(['name' => 'Beverages', 'description' => 'Cold drinks and craft sodas.']);

        // 2. Create Modifier Groups
        $modBurgerAddons = ModifierGroup::create([
            'name' => 'Burger Add-ons',
            'is_required' => false,
            'min_selections' => 0,
            'max_selections' => 4,
        ]);
        $modBurgerAddons->modifiers()->createMany([
            ['name' => 'Extra Cheese', 'price_adjustment' => 1.50],
            ['name' => 'Crispy Bacon', 'price_adjustment' => 2.00],
            ['name' => 'Avocado', 'price_adjustment' => 1.50],
            ['name' => 'Fried Egg', 'price_adjustment' => 1.00],
        ]);

        $modPizzaSize = ModifierGroup::create([
            'name' => 'Pizza Size',
            'is_required' => true,
            'min_selections' => 1,
            'max_selections' => 1,
        ]);
        $modPizzaSize->modifiers()->createMany([
            ['name' => 'Medium 12"', 'price_adjustment' => 0.00],
            ['name' => 'Large 14"', 'price_adjustment' => 4.00],
            ['name' => 'Family 18"', 'price_adjustment' => 8.00],
        ]);

        $modCrustType = ModifierGroup::create([
            'name' => 'Crust Type',
            'is_required' => true,
            'min_selections' => 1,
            'max_selections' => 1,
        ]);
        $modCrustType->modifiers()->createMany([
            ['name' => 'Classic Hand-Tossed', 'price_adjustment' => 0.00],
            ['name' => 'Thin Crust', 'price_adjustment' => 0.00],
            ['name' => 'Cheese Stuffed Crust', 'price_adjustment' => 3.50],
        ]);

        $modDrinkSize = ModifierGroup::create([
            'name' => 'Drink Size',
            'is_required' => true,
            'min_selections' => 1,
            'max_selections' => 1,
        ]);
        $modDrinkSize->modifiers()->createMany([
            ['name' => 'Regular (16oz)', 'price_adjustment' => 0.00],
            ['name' => 'Large (24oz)', 'price_adjustment' => 1.00],
        ]);

        $modDippingSauce = ModifierGroup::create([
            'name' => 'Dipping Sauces',
            'is_required' => false,
            'min_selections' => 0,
            'max_selections' => 3,
        ]);
        $modDippingSauce->modifiers()->createMany([
            ['name' => 'Ranch', 'price_adjustment' => 0.75],
            ['name' => 'Spicy Mayo', 'price_adjustment' => 0.75],
            ['name' => 'Truffle Aioli', 'price_adjustment' => 1.50],
        ]);


        // 3. Create Menu Items & Link Modifiers
        // BURGERS
        $burger1 = MenuItem::create([
            'menu_category_id' => $catBurgers->id,
            'name' => 'The Classic Smash',
            'description' => 'Double beef patty, American cheese, house sauce, caramelized onions, pickles on a brioche bun.',
            'price' => 12.99,
            'image' => 'menu-items/smash_burger.jpg',
            'is_active' => true,
            'is_available' => true,
        ]);
        $burger1->modifierGroups()->attach([$modBurgerAddons->id]);

        $burger2 = MenuItem::create([
            'menu_category_id' => $catBurgers->id,
            'name' => 'Truffle Mushroom Burger',
            'description' => 'Swiss cheese, roasted wild mushrooms, truffle aioli, arugula.',
            'price' => 14.99,
            'image' => 'menu-items/truffle_mushroom_burger.jpg',
            'is_active' => true,
            'is_available' => true,
        ]);
        $burger2->modifierGroups()->attach([$modBurgerAddons->id]);

        $burger3 = MenuItem::create([
            'menu_category_id' => $catBurgers->id,
            'name' => 'Spicy Inferno Burger',
            'description' => 'Pepper jack cheese, roasted jalapeños, crispy onion rings, spicy habanero mayo.',
            'price' => 13.49,
            'image' => 'menu-items/spicy_inferno_burger.jpg',
            'is_active' => true,
            'is_available' => true,
        ]);
        $burger3->modifierGroups()->attach([$modBurgerAddons->id]);

        // PIZZAS
        $pizza1 = MenuItem::create([
            'menu_category_id' => $catPizzas->id,
            'name' => 'Classic Margherita',
            'description' => 'San Marzano tomato sauce, fresh mozzarella, basil, extra virgin olive oil.',
            'price' => 16.99,
            'image' => 'menu-items/margherita_pizza.jpg',
            'is_active' => true,
            'is_available' => true,
        ]);
        $pizza1->modifierGroups()->attach([$modPizzaSize->id, $modCrustType->id, $modDippingSauce->id]);

        $pizza2 = MenuItem::create([
            'menu_category_id' => $catPizzas->id,
            'name' => 'Pepperoni Feast',
            'description' => 'Double pepperoni, mozzarella, hot honey drizzle, parmesan.',
            'price' => 19.99,
            'image' => 'menu-items/pepperoni_pizza.jpg',
            'is_active' => true,
            'is_available' => true,
        ]);
        $pizza2->modifierGroups()->attach([$modPizzaSize->id, $modCrustType->id, $modDippingSauce->id]);

        $pizza3 = MenuItem::create([
            'menu_category_id' => $catPizzas->id,
            'name' => 'BBQ Chicken Pizza',
            'description' => 'Grilled chicken, red onions, cilantro, mozzarella, smoked BBQ sauce base.',
            'price' => 18.99,
            'image' => 'menu-items/bbq_chicken_pizza.jpg',
            'is_active' => true,
            'is_available' => false, // Set to out of stock for demo
        ]);
        $pizza3->modifierGroups()->attach([$modPizzaSize->id, $modCrustType->id]);

        // SIDES
        $side1 = MenuItem::create([
            'menu_category_id' => $catSides->id,
            'name' => 'Truffle Parmesan Fries',
            'description' => 'Crispy shoestring fries tossed in truffle oil, parmesan, and parsley.',
            'price' => 7.99,
            'image' => 'menu-items/truffle_fries.jpg',
            'is_active' => true,
            'is_available' => true,
        ]);
        $side1->modifierGroups()->attach([$modDippingSauce->id]);

        $side2 = MenuItem::create([
            'menu_category_id' => $catSides->id,
            'name' => 'Crispy Mozzarella Sticks',
            'description' => '6 pieces of golden fried mozzarella with homemade marinara sauce.',
            'price' => 8.99,
            'image' => 'menu-items/mozzarella_sticks.jpg',
            'is_active' => true,
            'is_available' => true,
        ]);
        
        $side3 = MenuItem::create([
            'menu_category_id' => $catSides->id,
            'name' => 'Onion Rings',
            'description' => 'Thick-cut, beer-battered onion rings.',
            'price' => 6.99,
            'image' => 'menu-items/onion_rings.jpg',
            'is_active' => false, // Set to inactive for demo
            'is_available' => true,
        ]);
        $side3->modifierGroups()->attach([$modDippingSauce->id]);

        // BEVERAGES
        $bev1 = MenuItem::create([
            'menu_category_id' => $catBeverages->id,
            'name' => 'Craft Cola',
            'description' => 'Artisanal cane sugar cola.',
            'price' => 2.99,
            'image' => 'menu-items/craft_cola.jpg',
            'is_active' => true,
            'is_available' => true,
        ]);
        $bev1->modifierGroups()->attach([$modDrinkSize->id]);

        $bev2 = MenuItem::create([
            'menu_category_id' => $catBeverages->id,
            'name' => 'Fresh Lemonade',
            'description' => 'House-made strawberry basil lemonade.',
            'price' => 3.49,
            'image' => 'menu-items/fresh_lemonade.jpg',
            'is_active' => true,
            'is_available' => true,
        ]);
        $bev2->modifierGroups()->attach([$modDrinkSize->id]);
    }
}

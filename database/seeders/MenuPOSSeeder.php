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
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        DB::table('menu_item_modifier_group')->truncate();
        MenuItem::truncate();
        Modifier::truncate();
        ModifierGroup::truncate();
        MenuCategory::truncate();
        \App\Models\RecipeItem::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

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
        $burger1->modifierGroups()->attach([
            $modBurgerAddons->id => ['id' => \Illuminate\Support\Str::uuid()]
        ]);

        $burger2 = MenuItem::create([
            'menu_category_id' => $catBurgers->id,
            'name' => 'Truffle Mushroom Burger',
            'description' => 'Swiss cheese, roasted wild mushrooms, truffle aioli, arugula.',
            'price' => 14.99,
            'image' => 'menu-items/truffle_mushroom_burger.jpg',
            'is_active' => true,
            'is_available' => true,
        ]);
        $burger2->modifierGroups()->attach([
            $modBurgerAddons->id => ['id' => \Illuminate\Support\Str::uuid()]
        ]);

        $burger3 = MenuItem::create([
            'menu_category_id' => $catBurgers->id,
            'name' => 'Spicy Inferno Burger',
            'description' => 'Pepper jack cheese, roasted jalapeños, crispy onion rings, spicy habanero mayo.',
            'price' => 13.49,
            'image' => 'menu-items/spicy_inferno_burger.jpg',
            'is_active' => true,
            'is_available' => true,
        ]);
        $burger3->modifierGroups()->attach([
            $modBurgerAddons->id => ['id' => \Illuminate\Support\Str::uuid()]
        ]);

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
        $pizza1->modifierGroups()->attach([
            $modPizzaSize->id => ['id' => \Illuminate\Support\Str::uuid()],
            $modCrustType->id => ['id' => \Illuminate\Support\Str::uuid()],
            $modDippingSauce->id => ['id' => \Illuminate\Support\Str::uuid()]
        ]);

        $pizza2 = MenuItem::create([
            'menu_category_id' => $catPizzas->id,
            'name' => 'Pepperoni Feast',
            'description' => 'Double pepperoni, mozzarella, hot honey drizzle, parmesan.',
            'price' => 19.99,
            'image' => 'menu-items/pepperoni_pizza.jpg',
            'is_active' => true,
            'is_available' => true,
        ]);
        $pizza2->modifierGroups()->attach([
            $modPizzaSize->id => ['id' => \Illuminate\Support\Str::uuid()],
            $modCrustType->id => ['id' => \Illuminate\Support\Str::uuid()],
            $modDippingSauce->id => ['id' => \Illuminate\Support\Str::uuid()]
        ]);

        $pizza3 = MenuItem::create([
            'menu_category_id' => $catPizzas->id,
            'name' => 'BBQ Chicken Pizza',
            'description' => 'Grilled chicken, red onions, cilantro, mozzarella, smoked BBQ sauce base.',
            'price' => 18.99,
            'image' => 'menu-items/bbq_chicken_pizza.jpg',
            'is_active' => true,
            'is_available' => false, // Set to out of stock for demo
        ]);
        $pizza3->modifierGroups()->attach([
            $modPizzaSize->id => ['id' => \Illuminate\Support\Str::uuid()],
            $modCrustType->id => ['id' => \Illuminate\Support\Str::uuid()]
        ]);

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
        $side1->modifierGroups()->attach([
            $modDippingSauce->id => ['id' => \Illuminate\Support\Str::uuid()]
        ]);

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
        $side3->modifierGroups()->attach([
            $modDippingSauce->id => ['id' => \Illuminate\Support\Str::uuid()]
        ]);

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
        $bev1->modifierGroups()->attach([
            $modDrinkSize->id => ['id' => \Illuminate\Support\Str::uuid()]
        ]);

        $bev2 = MenuItem::create([
            'menu_category_id' => $catBeverages->id,
            'name' => 'Fresh Lemonade',
            'description' => 'House-made strawberry basil lemonade.',
            'price' => 3.49,
            'image' => 'menu-items/fresh_lemonade.jpg',
            'is_active' => true,
            'is_available' => true,
        ]);
        $bev2->modifierGroups()->attach([
            $modDrinkSize->id => ['id' => \Illuminate\Support\Str::uuid()]
        ]);

        // 6. Create Dummy Dining Zones & Tables for all Business Locations
        $locations = \App\Models\BusinessLocation::all();
        foreach ($locations as $loc) {
            $mainHall = \App\Models\DiningZone::firstOrCreate([
                'business_location_id' => $loc->id,
                'name' => 'Main Dining Hall',
            ], [
                'description' => 'Primary indoor dining area',
            ]);

            $terrace = \App\Models\DiningZone::firstOrCreate([
                'business_location_id' => $loc->id,
                'name' => 'Outdoor Terrace',
            ], [
                'description' => 'Patio & open-air seating',
            ]);

            $vipLounge = \App\Models\DiningZone::firstOrCreate([
                'business_location_id' => $loc->id,
                'name' => 'VIP Lounge',
            ], [
                'description' => 'Private dining & party booths',
            ]);

            // Table 1: 2-Seater (Couples / Small)
            \App\Models\DiningTable::firstOrCreate(
                ['dining_zone_id' => $mainHall->id, 'name' => 'Table 1'],
                ['seating_capacity' => 2, 'status' => 'available']
            );

            // Table 2: 4-Seater (Standard Family)
            \App\Models\DiningTable::firstOrCreate(
                ['dining_zone_id' => $mainHall->id, 'name' => 'Table 2'],
                ['seating_capacity' => 4, 'status' => 'available']
            );

            // Table 3: 6-Seater (Group Table)
            \App\Models\DiningTable::firstOrCreate(
                ['dining_zone_id' => $mainHall->id, 'name' => 'Table 3'],
                ['seating_capacity' => 6, 'status' => 'available']
            );

            // Table 4: Outdoor 4-Seater
            \App\Models\DiningTable::firstOrCreate(
                ['dining_zone_id' => $terrace->id, 'name' => 'Patio T-1'],
                ['seating_capacity' => 4, 'status' => 'available']
            );

            // Table 5: 8-Seater VIP Booth
            \App\Models\DiningTable::firstOrCreate(
                ['dining_zone_id' => $vipLounge->id, 'name' => 'VIP Suite A'],
                ['seating_capacity' => 8, 'status' => 'available']
            );
        }
    }
}

<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\MenuItem;

$mapping = [
    'The Classic Smash' => 'menu-items/smash_burger.jpg',
    'Truffle Mushroom Burger' => 'menu-items/truffle_mushroom_burger.jpg',
    'Spicy Inferno Burger' => 'menu-items/spicy_inferno_burger.jpg',
    'Classic Margherita' => 'menu-items/margherita_pizza.jpg',
    'Pepperoni Feast' => 'menu-items/pepperoni_pizza.jpg',
    'BBQ Chicken Pizza' => 'menu-items/bbq_chicken_pizza.jpg',
    'Truffle Parmesan Fries' => 'menu-items/truffle_fries.jpg',
    'Crispy Mozzarella Sticks' => 'menu-items/mozzarella_sticks.jpg',
    'Onion Rings' => 'menu-items/onion_rings.jpg',
    'Craft Cola' => 'menu-items/craft_cola.jpg',
    'Fresh Lemonade' => 'menu-items/fresh_lemonade.jpg',
];

foreach ($mapping as $name => $imagePath) {
    $item = MenuItem::where('name', $name)->first();
    if ($item) {
        $item->update(['image' => $imagePath]);
        echo "Updated $name -> $imagePath\n";
    } else {
        echo "Item not found: $name\n";
    }
}

echo "All menu item images updated in database.\n";

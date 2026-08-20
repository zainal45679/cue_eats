<?php

$storageDir = __DIR__ . '/../storage/app/public/menu-items';
$publicDir = __DIR__ . '/../public/storage/menu-items';

if (!file_exists($storageDir)) {
    mkdir($storageDir, 0755, true);
}
if (!file_exists($publicDir)) {
    mkdir($publicDir, 0755, true);
}

$images = [
    'smash_burger.jpg' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    'truffle_mushroom_burger.jpg' => 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    'spicy_inferno_burger.jpg' => 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    'margherita_pizza.jpg' => 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
    'pepperoni_pizza.jpg' => 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    'bbq_chicken_pizza.jpg' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    'truffle_fries.jpg' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    'mozzarella_sticks.jpg' => 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?auto=format&fit=crop&w=800&q=80',
    'onion_rings.jpg' => 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=80',
    'craft_cola.jpg' => 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    'fresh_lemonade.jpg' => 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80',
];

foreach ($images as $filename => $url) {
    echo "Downloading $filename...\n";
    $content = @file_get_contents($url);
    if ($content !== false) {
        file_put_contents("$storageDir/$filename", $content);
        file_put_contents("$publicDir/$filename", $content);
        echo "Successfully saved $filename.\n";
    } else {
        echo "Failed to download $filename.\n";
    }
}

echo "Image download task completed.\n";

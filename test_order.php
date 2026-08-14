<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$order = \App\Models\Order::first();
echo "Order Subtotal: " . $order->subtotal . "\n";
echo "Item count before load: " . ($order->relationLoaded('items') ? $order->items->count() : 'not loaded') . "\n";
$order->load('items.modifiers');
echo "Item count after load: " . $order->items->count() . "\n";

$subtotal = 0;
foreach ($order->items as $item) {
    $itemTotal = $item->unit_price;
    foreach ($item->modifiers as $mod) {
        $itemTotal += $mod->price_adjustment;
    }
    $subtotal += ($itemTotal * $item->quantity);
}
echo "Calculated subtotal: " . $subtotal . "\n";

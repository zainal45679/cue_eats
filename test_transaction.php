<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

DB::beginTransaction();
try {
    $order = Order::first();
    echo "Before load count: " . $order->items()->count() . "\n";
    $item = OrderItem::create([
        'pos_order_id' => $order->id,
        'menu_item_id' => \App\Models\MenuItem::first()->id,
        'quantity' => 2,
        'unit_price' => 10,
        'subtotal' => 20
    ]);
    
    $order->load('items.modifiers');
    echo "After load count: " . $order->items->count() . "\n";
    
    DB::rollBack();
} catch (\Exception $e) {
    DB::rollBack();
    echo "Error: " . $e->getMessage() . "\n";
}

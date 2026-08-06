<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemModifier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PosController extends Controller
{
    public function index()
    {
        $categories = MenuCategory::with(['items.modifierGroups.modifiers'])->where('is_active', true)->get();
        
        return Inertia::render('menu-pos/terminal/index', [
            'categories' => $categories
        ]);
    }

    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'nullable|string',
            'order_type' => 'required|string',
            'payment_method' => 'required|string',
            'cart' => 'required|array|min:1',
            'cart.*.menu_item_id' => 'required|exists:menu_items,id',
            'cart.*.quantity' => 'required|integer|min:1',
            'cart.*.price' => 'required|numeric|min:0',
            'cart.*.notes' => 'nullable|string',
            'cart.*.modifiers' => 'nullable|array',
            'cart.*.modifiers.*.modifier_id' => 'required|exists:modifiers,id',
            'cart.*.modifiers.*.price_adjustment' => 'required|numeric'
        ]);

        DB::beginTransaction();
        try {
            // Generate order number
            $orderNumber = 'ORD-' . strtoupper(uniqid());
            
            // Calculate totals
            $subtotal = 0;
            foreach ($validated['cart'] as $item) {
                $itemTotal = $item['price'];
                if (!empty($item['modifiers'])) {
                    foreach ($item['modifiers'] as $mod) {
                        $itemTotal += $mod['price_adjustment'];
                    }
                }
                $subtotal += ($itemTotal * $item['quantity']);
            }
            
            // For now tax is hardcoded 0
            $tax_total = 0;
            $grand_total = $subtotal + $tax_total;

            $locationId = session('active_location_id', \App\Models\BusinessLocation::first()?->id ?? 1);
            $storageLocation = \App\Models\StorageLocation::where('business_location_id', $locationId)->first();
            $storageLocationId = $storageLocation ? $storageLocation->id : 1;

            $order = Order::create([
                'order_number' => $orderNumber,
                'business_location_id' => $locationId,
                'user_id' => auth()->id(),
                'customer_name' => $validated['customer_name'] ?? null,
                'order_type' => $validated['order_type'],
                'status' => 'Completed',
                'subtotal' => $subtotal,
                'tax_total' => $tax_total,
                'discount_total' => 0,
                'grand_total' => $grand_total,
                'payment_method' => $validated['payment_method'],
            ]);

            foreach ($validated['cart'] as $item) {
                $orderItem = OrderItem::create([
                    'pos_order_id' => $order->id,
                    'menu_item_id' => $item['menu_item_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'subtotal' => $item['price'] * $item['quantity'],
                    'notes' => $item['notes'] ?? null,
                ]);

                // Deduct Inventory for Menu Item
                $menuItemRecipes = \App\Models\RecipeItem::where('menu_item_id', $item['menu_item_id'])->get();
                foreach ($menuItemRecipes as $recipe) {
                    $deductQty = $recipe->quantity * $item['quantity'];
                    $this->deductInventory($recipe->ingredient_id, $storageLocationId, $locationId, $deductQty, $order->id);
                }

                if (!empty($item['modifiers'])) {
                    foreach ($item['modifiers'] as $mod) {
                        OrderItemModifier::create([
                            'pos_order_item_id' => $orderItem->id,
                            'modifier_id' => $mod['modifier_id'],
                            'price_adjustment' => $mod['price_adjustment'],
                        ]);

                        // Deduct Inventory for Modifier
                        $modifierRecipes = \App\Models\RecipeItem::where('modifier_id', $mod['modifier_id'])->get();
                        foreach ($modifierRecipes as $recipe) {
                            $deductQty = $recipe->quantity * $item['quantity'];
                            $this->deductInventory($recipe->ingredient_id, $storageLocationId, $locationId, $deductQty, $order->id);
                        }
                    }
                }
            }

            DB::commit();
            return back()->with('success', "Order {$orderNumber} completed successfully.");
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Order Processing Failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return back()->withErrors(['error' => 'Failed to process order: ' . $e->getMessage()]);
        }
    }

    private function deductInventory($ingredientId, $storageLocationId, $businessLocationId, $quantity, $orderId)
    {
        $balance = \App\Models\InventoryBalance::firstOrCreate(
            ['ingredient_id' => $ingredientId, 'storage_location_id' => $storageLocationId],
            ['available_qty' => 0, 'reserved_qty' => 0, 'on_order_qty' => 0]
        );

        $balance->available_qty -= $quantity;
        $balance->save();

        \App\Models\InventoryLedger::create([
            'business_location_id' => $businessLocationId,
            'ingredient_id' => $ingredientId,
            'transaction_type' => 'SALE',
            'reference_type' => \App\Models\Order::class,
            'reference_id' => $orderId,
            'quantity' => -$quantity,
            'running_balance' => $balance->available_qty,
            'created_by' => auth()->id() ?? 1,
        ]);
    }
}

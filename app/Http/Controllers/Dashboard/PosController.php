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
    public function index(Request $request)
    {
        $table = null;
        $activeOrder = null;
        
        if ($request->table_id) {
            $table = \App\Models\DiningTable::find($request->table_id);
            if ($table) {
                $activeOrder = \App\Models\Order::with(['items.modifiers', 'items.menuItem', 'waiter'])
                    ->where('dining_table_id', $table->id)
                    ->whereIn('status', ['running', 'billed'])
                    ->latest()
                    ->first();
            }
        }
        // Eager load recipe items to check inventory
        $categories = MenuCategory::with(['items.modifierGroups.modifiers.recipeItems', 'items.recipeItems'])->where('is_active', true)->get();
        
        // Gather all required ingredient IDs
        $ingredientIds = [];
        foreach ($categories as $cat) {
            foreach ($cat->items as $item) {
                foreach ($item->recipeItems as $recipe) {
                    $ingredientIds[] = $recipe->ingredient_id;
                }
                foreach ($item->modifierGroups as $group) {
                    foreach ($group->modifiers as $mod) {
                        foreach ($mod->recipeItems as $recipe) {
                            $ingredientIds[] = $recipe->ingredient_id;
                        }
                    }
                }
            }
        }
        
        $balances = [];
        // Check real-time inventory balances
        if (!empty($ingredientIds)) {
            $balancesList = \App\Models\InventoryBalance::whereIn('ingredient_id', array_unique($ingredientIds))
                ->selectRaw('ingredient_id, SUM(available_qty) as total_qty')
                ->groupBy('ingredient_id')
                ->pluck('total_qty', 'ingredient_id');
            
            $balances = $balancesList->toArray();
                
            // Dynamically mark items as out of stock if any required ingredient is insufficient
            foreach ($categories as $cat) {
                foreach ($cat->items as $item) {
                    if ($item->is_available) { // Only override if it wasn't manually disabled
                        foreach ($item->recipeItems as $recipe) {
                            $availableQty = $balances[$recipe->ingredient_id] ?? 0;
                            if ($availableQty < $recipe->quantity) {
                                $item->is_available = false;
                                break;
                            }
                        }
                    }
                }
            }
        }

        // Ensure waiter role exists to prevent RoleDoesNotExist exceptions
        \App\Models\Role::firstOrCreate(['name' => 'waiter', 'guard_name' => 'web']);

        $locationId = auth()->user()->hasRole('admin') 
            ? session('active_location_id', auth()->user()->business_location_id) 
            : auth()->user()->business_location_id;

        $waitersQuery = \App\Models\User::role('waiter');
        if ($locationId) {
            $waitersQuery->where(function($q) use ($locationId) {
                $q->where('business_location_id', $locationId)
                  ->orWhereNull('business_location_id');
            });
        }
        $waiters = $waitersQuery->get(['id', 'name']);
        if ($waiters->isEmpty()) {
            $waiters = \App\Models\User::role('waiter')->get(['id', 'name']);
        }

        return Inertia::render('menu-pos/terminal/index', [
            'categories' => $categories,
            'inventoryBalances' => $balances,
            'waiters' => $waiters,
            'table' => $table,
            'activeOrder' => $activeOrder
        ]);
    }

    public function openTable(Request $request)
    {
        $request->validate(['table_id' => 'required|exists:dining_tables,id']);
        $table = \App\Models\DiningTable::find($request->table_id);
        
        $locationId = auth()->user()->hasRole('admin') 
            ? session('active_location_id', \App\Models\BusinessLocation::first()?->id ?? 1) 
            : auth()->user()->business_location_id;

        $activeOrder = \App\Models\Order::where('dining_table_id', $table->id)
            ->whereNotIn('status', ['paid', 'cancelled'])
            ->first();

        if (!$activeOrder) {
            $nextId = \App\Models\Order::count() + 1;
            while (\App\Models\Order::where('order_number', 'ORD-' . $nextId)->exists()) {
                $nextId++;
            }
            $orderNumber = 'ORD-' . $nextId;

            \App\Models\Order::create([
                'order_number' => $orderNumber,
                'business_location_id' => $locationId,
                'user_id' => auth()->id(),
                'order_type' => 'Dine-in',
                'dining_table_id' => $table->id,
                'status' => 'draft',
                'kitchen_status' => 'pending',
                'subtotal' => 0,
                'tax_total' => 0,
                'grand_total' => 0,
            ]);
        }

        return redirect()->route('pos.terminal', ['table_id' => $table->id]);
    }

    public function checkout(Request $request)
    {
        if (!$request->has('action')) {
            $request->merge(['action' => 'settle']);
        }

        $validated = $request->validate([
            'order_id' => 'nullable|exists:pos_orders,id',
            'action' => 'required|in:save_kot,print_bill,settle,cancel_draft',
            'customer_name' => 'nullable|string',
            'order_type' => 'required|string',
            'payment_method' => 'nullable|string',
            'dining_table_id' => 'nullable|exists:dining_tables,id',
            'waiter_id' => 'nullable|exists:users,id',
            'pax' => 'nullable|integer|min:1',
            'cart' => 'nullable|array',
            'cart.*.menu_item_id' => 'required|exists:menu_items,id',
            'cart.*.quantity' => 'required|integer|min:1',
            'cart.*.price' => 'required|numeric|min:0',
            'cart.*.notes' => 'nullable|string',
            'cart.*.modifiers' => 'nullable|array',
            'cart.*.modifiers.*.modifier_id' => 'required|exists:modifiers,id',
            'cart.*.modifiers.*.price_adjustment' => 'required|numeric',
            'allow_override' => 'nullable|boolean',
        ]);

        $allowOverride = (bool) ($validated['allow_override'] ?? false);

        // Specific validation for settle
        if ($validated['action'] === 'settle' && empty($validated['payment_method'])) {
            return back()->withErrors(['payment_method' => 'Payment method is required to settle the bill.']);
        }

        try {
            $result = DB::transaction(function () use ($validated, $request, $allowOverride) {
                if ($validated['action'] === 'cancel_draft' && !empty($validated['order_id'])) {
                    $order = Order::find($validated['order_id']);
                    if ($order && $order->status === 'draft') {
                        $order->delete();
                        return redirect()->route('pos.tables')->with('success', 'Table released.');
                    }
                }

                $locationId = auth()->user()->hasRole('admin') 
                    ? session('active_location_id', \App\Models\BusinessLocation::first()?->id ?? 1) 
                    : auth()->user()->business_location_id;
                    
                $storageLocation = \App\Models\StorageLocation::where('business_location_id', $locationId)->first();
                $storageLocationId = $storageLocation ? $storageLocation->id : 1;

                $order = null;
                if (!empty($validated['order_id'])) {
                    $order = Order::find($validated['order_id']);
                    // Update basic details if changed
                    if (isset($validated['pax'])) $order->pax = $validated['pax'];
                    if (isset($validated['waiter_id'])) $order->waiter_id = $validated['waiter_id'];
                    if ($validated['action'] === 'save_kot') $order->status = 'running';
                    $order->save();
                } else {
                    // Generate sequential order number
                    $nextId = \App\Models\Order::count() + 1;
                    while (\App\Models\Order::where('order_number', 'ORD-' . $nextId)->exists()) {
                        $nextId++;
                    }
                    $orderNumber = 'ORD-' . $nextId;

                    $order = Order::create([
                        'order_number' => $orderNumber,
                        'business_location_id' => $locationId,
                        'user_id' => auth()->id(),
                        'customer_name' => $validated['customer_name'] ?? null,
                        'order_type' => $validated['order_type'],
                        'dining_table_id' => $validated['dining_table_id'] ?? null,
                        'waiter_id' => $validated['waiter_id'] ?? null,
                        'pax' => $validated['pax'] ?? null,
                        'status' => 'running',
                        'kitchen_status' => 'pending',
                        'subtotal' => 0,
                        'tax_total' => 0,
                        'discount_total' => 0,
                        'grand_total' => 0,
                        'payment_method' => null,
                    ]);
                }

                // Append NEW items if any
                if (!empty($validated['cart'])) {
                    foreach ($validated['cart'] as $item) {
                        $orderItem = OrderItem::create([
                            'pos_order_id' => $order->id,
                            'menu_item_id' => $item['menu_item_id'],
                            'quantity' => $item['quantity'],
                            'unit_price' => $item['price'],
                            'subtotal' => $item['price'] * $item['quantity'],
                            'notes' => $item['notes'] ?? null,
                        ]);

                        if (!empty($item['modifiers'])) {
                            foreach ($item['modifiers'] as $mod) {
                                OrderItemModifier::create([
                                    'pos_order_item_id' => $orderItem->id,
                                    'modifier_id' => $mod['modifier_id'],
                                    'price_adjustment' => $mod['price_adjustment'],
                                ]);
                            }
                        }

                        // Deduct Inventory for Menu Item and Modifiers via InventoryDeductionService
                        \App\Services\InventoryDeductionService::deductOrderItem($orderItem, $locationId, $allowOverride);
                    }
                }

                // Recalculate Totals
                $order->load('items.modifiers');
                $subtotal = 0;
                foreach ($order->items as $item) {
                    $itemTotal = $item->unit_price;
                    foreach ($item->modifiers as $mod) {
                        $itemTotal += $mod->price_adjustment;
                    }
                    $subtotal += ($itemTotal * $item->quantity);
                }
                
                $tax_total = 0; // Hardcoded 0 for now
                $order->subtotal = $subtotal;
                $order->tax_total = $tax_total;
                $order->grand_total = $subtotal + $tax_total;

                // Update Status based on action
                if ($validated['action'] === 'settle') {
                    if (($validated['payment_method'] ?? null) === 'Cash') {
                        $tendered = floatval($request->input('tendered_amount', 0));
                        if ($tendered > 0 && round($tendered, 2) < round($order->grand_total, 2)) {
                            throw \Illuminate\Validation\ValidationException::withMessages([
                                'tendered_amount' => 'Insufficient cash tendered. Total due is $' . number_format($order->grand_total, 2)
                            ]);
                        }
                    }
                    $order->status = 'Completed';
                    $order->payment_method = $validated['payment_method'];
                } else if ($validated['action'] === 'print_bill') {
                    $order->status = 'billed';
                } else {
                    $order->status = 'running';
                }
                
                $order->save();

                // Update Dining Table Status if applicable
                if ($order->dining_table_id) {
                    $table = \App\Models\DiningTable::find($order->dining_table_id);
                    if ($table) {
                        if ($order->status === 'Completed') {
                            $table->status = 'available';
                        } else if ($order->status === 'billed') {
                            $table->status = 'billed';
                        } else {
                            $table->status = 'occupied';
                        }
                        $table->save();
                    }
                }

                return $order;
            });

            if ($result instanceof \Illuminate\Http\RedirectResponse) {
                return $result;
            }

            $order = $result;
            $order->load(['items.menuItem', 'items.modifiers.modifier', 'location', 'cashier']);
            
            // Broadcast KOT only if there were new items
            if (!empty($validated['cart'])) {
                event(new \App\Events\OrderCreated($order));
            }
            
            // Redirect based on action
            if ($order->status === 'Completed' || $order->status === 'billed') {
                return redirect()->route('pos.tables')->with([
                    'success' => "Order {$order->order_number} " . ($order->status === 'Completed' ? 'settled' : 'billed') . " successfully.",
                    'recent_order' => $order
                ]);
            }
            
            return back()->with([
                'success' => "KOT for {$order->order_number} saved.",
                'recent_order' => $order
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Order Processing Failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return back()->withErrors(['error' => 'Failed to process order: ' . $e->getMessage()]);
        }
    }

    public function checkStock(Request $request)
    {
        $validated = $request->validate([
            'cart' => 'nullable|array',
            'cart.*.menu_item_id' => 'required|exists:menu_items,id',
            'cart.*.quantity' => 'required|integer|min:1',
            'cart.*.modifiers' => 'nullable|array',
            'cart.*.modifiers.*.modifier_id' => 'required|exists:modifiers,id',
        ]);

        $locationId = auth()->user()->hasRole('admin') 
            ? session('active_location_id', auth()->user()->business_location_id) 
            : auth()->user()->business_location_id;

        $requiredIngredients = []; // ingredient_id => total_required_qty

        if (!empty($validated['cart'])) {
            foreach ($validated['cart'] as $item) {
                $itemQty = (float) $item['quantity'];
                $recipes = \App\Models\RecipeItem::where('menu_item_id', $item['menu_item_id'])->get();
                foreach ($recipes as $recipe) {
                    $requiredIngredients[$recipe->ingredient_id] = ($requiredIngredients[$recipe->ingredient_id] ?? 0) + ($recipe->quantity * $itemQty);
                }

                if (!empty($item['modifiers'])) {
                    foreach ($item['modifiers'] as $mod) {
                        $modRecipes = \App\Models\RecipeItem::where('modifier_id', $mod['modifier_id'])->get();
                        foreach ($modRecipes as $recipe) {
                            $requiredIngredients[$recipe->ingredient_id] = ($requiredIngredients[$recipe->ingredient_id] ?? 0) + ($recipe->quantity * $itemQty);
                        }
                    }
                }
            }
        }

        $outOfStock = [];

        foreach ($requiredIngredients as $ingredientId => $reqQty) {
            $ingredient = \App\Models\Ingredient::with('baseUom')->find($ingredientId);
            $totalAvailable = \App\Models\InventoryBalance::whereHas('storageLocation', function($q) use ($locationId) {
                $q->where('business_location_id', $locationId);
            })->where('ingredient_id', $ingredientId)->sum('available_qty');

            if ((float) $totalAvailable < (float) $reqQty) {
                $outOfStock[] = [
                    'ingredient_id' => $ingredientId,
                    'ingredient_name' => $ingredient ? $ingredient->name : 'Unknown',
                    'required_qty' => $reqQty,
                    'available_qty' => (float) $totalAvailable,
                    'uom_name' => $ingredient?->baseUom?->name ?? 'Unit',
                ];
            }
        }

        return response()->json([
            'is_available' => empty($outOfStock),
            'out_of_stock_items' => $outOfStock,
        ]);
    }

    private function deductInventory($ingredientId, $storageLocationId, $businessLocationId, $quantity, $orderId, $allowOverride = false)
    {
        $balance = \App\Models\InventoryBalance::firstOrCreate(
            ['ingredient_id' => $ingredientId, 'storage_location_id' => $storageLocationId],
            ['available_qty' => 0, 'reserved_qty' => 0, 'on_order_qty' => 0]
        );

        $targetBalance = $balance;

        if ((float) $balance->available_qty < (float) $quantity) {
            // Check if another storage location in the SAME branch has available stock
            $alternateBalance = \App\Models\InventoryBalance::whereHas('storageLocation', function($q) use ($businessLocationId) {
                $q->where('business_location_id', $businessLocationId);
            })
            ->where('ingredient_id', $ingredientId)
            ->where('available_qty', '>=', $quantity)
            ->first();

            if ($alternateBalance) {
                $targetBalance = $alternateBalance;
            } else if (!$allowOverride) {
                $ingredient = \App\Models\Ingredient::find($ingredientId);
                throw new \Exception("Insufficient stock for ingredient: " . ($ingredient ? $ingredient->name : 'Unknown'));
            }
        }

        $targetBalance->available_qty -= $quantity;
        $targetBalance->save();

        \App\Models\InventoryLedger::create([
            'business_location_id' => $businessLocationId,
            'storage_location_id' => $targetBalance->storage_location_id,
            'ingredient_id' => $ingredientId,
            'transaction_type' => 'sale',
            'reference_type' => \App\Models\Order::class,
            'reference_id' => $orderId,
            'quantity' => -$quantity,
            'running_balance' => $targetBalance->available_qty,
            'created_by' => auth()->id() ?? \App\Models\User::first()?->id,
        ]);
    }
}

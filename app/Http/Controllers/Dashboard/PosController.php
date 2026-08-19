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
                    ->whereIn('status', ['draft', 'running', 'billed'])
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
        
        $activeOrder = \App\Models\Order::where('dining_table_id', $table->id)
            ->whereNotIn('status', ['paid', 'cancelled', 'Completed'])
            ->first();

        if ($activeOrder && $activeOrder->user_id !== auth()->id() && !auth()->user()->hasRole('admin')) {
            return redirect()->back()->with('error', 'This table is currently occupied by another waiter.');
        }

        return redirect()->route('pos.terminal', ['table_id' => $table->id]);
    }

    public function occupyTable(Request $request)
    {
        $request->validate(['table_id' => 'required|exists:dining_tables,id']);
        $table = \App\Models\DiningTable::with('zone')->find($request->table_id);
        
        $locationId = auth()->user()->hasRole('admin') 
            ? session('active_location_id') 
            : auth()->user()->business_location_id;
            
        if (!$locationId && $table && $table->zone) {
            $locationId = $table->zone->business_location_id;
        }
        if (!$locationId) {
            $locationId = \App\Models\BusinessLocation::first()?->id ?? 1;
        }

        $activeOrder = \App\Models\Order::where('dining_table_id', $table->id)
            ->whereNotIn('status', ['paid', 'cancelled', 'Completed'])
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
            
            event(new \App\Events\TableStatusUpdated($table->id, $locationId));
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
                        $tableId = $order->dining_table_id;
                        $locationId = $order->business_location_id;
                        $order->delete();
                        if ($tableId) {
                            \App\Models\DiningTable::where('parent_table_id', $tableId)->update(['parent_table_id' => null]);
                            $tbl = \App\Models\DiningTable::find($tableId);
                            if ($tbl) {
                                $tbl->status = 'available';
                                $tbl->parent_table_id = null;
                                $tbl->save();
                            }
                            DB::afterCommit(function () use ($tableId, $locationId) {
                                event(new \App\Events\TableStatusUpdated($tableId, $locationId));
                            });
                        }
                        return redirect()->route('pos.tables')->with('success', 'Table released.');
                    }
                }

                $locationId = auth()->user()->hasRole('admin') 
                    ? session('active_location_id') 
                    : auth()->user()->business_location_id;
                    
                if (!$locationId && !empty($validated['dining_table_id'])) {
                    $table = \App\Models\DiningTable::with('zone')->find($validated['dining_table_id']);
                    if ($table && $table->zone) {
                        $locationId = $table->zone->business_location_id;
                    }
                }
                
                if (!$locationId) {
                    $locationId = \App\Models\BusinessLocation::first()?->id ?? 1;
                }
                    
                $storageLocation = \App\Models\StorageLocation::where('business_location_id', $locationId)->first();
                $storageLocationId = $storageLocation ? $storageLocation->id : 1;

                $order = null;
                if (!empty($validated['order_id'])) {
                    $order = Order::find($validated['order_id']);
                    // Update basic details if changed
                    if (isset($validated['pax'])) $order->pax = $validated['pax'];
                    if (isset($validated['waiter_id'])) $order->waiter_id = $validated['waiter_id'];
                    if (isset($validated['dining_table_id'])) $order->dining_table_id = $validated['dining_table_id'];
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

                // Create KOT Round if saving KOT or placing order with items
                $recentKotPayload = null;
                if (!empty($validated['cart'])) {
                    // Reset kitchen_status to pending if order was previously marked ready or rejected
                    if (in_array($order->kitchen_status, ['ready', 'rejected'])) {
                        $order->kitchen_status = 'pending';
                    }

                    // Determine Next KOT Round Number
                    $currentMaxRound = \App\Models\PosKot::where('pos_order_id', $order->id)->max('round_number') ?? 0;
                    $nextRound = $currentMaxRound + 1;
                    $kotNumber = 'KOT-' . $order->order_number . '-R' . $nextRound;

                    $posKot = \App\Models\PosKot::create([
                        'pos_order_id' => $order->id,
                        'round_number' => $nextRound,
                        'kot_number' => $kotNumber,
                        'created_by' => auth()->id(),
                    ]);

                    $kotItemsPayload = [];

                    foreach ($validated['cart'] as $item) {
                        $modAdjustment = 0;
                        if (!empty($item['modifiers'])) {
                            foreach ($item['modifiers'] as $mod) {
                                $modAdjustment += floatval($mod['price_adjustment'] ?? 0);
                            }
                        }
                        $unitPriceWithMods = floatval($item['price']) + $modAdjustment;

                        $orderItem = OrderItem::create([
                            'pos_order_id' => $order->id,
                            'menu_item_id' => $item['menu_item_id'],
                            'quantity' => $item['quantity'],
                            'unit_price' => $unitPriceWithMods,
                            'subtotal' => $unitPriceWithMods * $item['quantity'],
                            'notes' => $item['notes'] ?? null,
                            'kot_round' => $nextRound,
                        ]);

                        $kotItem = \App\Models\PosKotItem::create([
                            'pos_kot_id' => $posKot->id,
                            'menu_item_id' => $item['menu_item_id'],
                            'quantity' => $item['quantity'],
                            'notes' => $item['notes'] ?? null,
                        ]);

                        $modifierDetails = [];

                        if (!empty($item['modifiers'])) {
                            foreach ($item['modifiers'] as $mod) {
                                OrderItemModifier::create([
                                    'pos_order_item_id' => $orderItem->id,
                                    'modifier_id' => $mod['modifier_id'],
                                    'price_adjustment' => $mod['price_adjustment'],
                                ]);

                                \App\Models\PosKotItemModifier::create([
                                    'pos_kot_item_id' => $kotItem->id,
                                    'modifier_id' => $mod['modifier_id'],
                                    'price_adjustment' => $mod['price_adjustment'],
                                ]);

                                $modModel = \App\Models\Modifier::find($mod['modifier_id']);
                                if ($modModel) {
                                    $modifierDetails[] = ['modifier_name' => $modModel->name];
                                }
                            }
                        }

                        $menuItemModel = \App\Models\MenuItem::find($item['menu_item_id']);

                        $kotItemsPayload[] = [
                            'id' => $kotItem->id,
                            'menu_item_name' => $menuItemModel?->name ?? 'Item',
                            'quantity' => $item['quantity'],
                            'notes' => $item['notes'] ?? null,
                            'modifiers' => $modifierDetails,
                        ];

                        // Deduct Inventory for Menu Item and Modifiers via InventoryDeductionService
                        \App\Services\InventoryDeductionService::deductOrderItem($orderItem, $locationId, $allowOverride);
                    }

                    $order->load(['diningTable', 'waiter']);
                    $recentKotPayload = [
                        'id' => $posKot->id,
                        'kot_number' => $posKot->kot_number,
                        'round_number' => $posKot->round_number,
                        'order_number' => $order->order_number,
                        'table_name' => $order->diningTable?->name ?? 'Table',
                        'order_type' => $order->order_type,
                        'waiter_name' => $order->waiter?->name ?? auth()->user()->name,
                        'created_at' => $posKot->created_at->toIso8601String(),
                        'items' => $kotItemsPayload,
                    ];
                } else if ($validated['action'] === 'save_kot') {
                    // No new items provided when save_kot was clicked
                    return back()->with('info', 'No new items to send to kitchen.');
                }

                // Recalculate Totals if items exist
                $order->load('items');
                if ($order->items->count() > 0) {
                    $subtotal = 0;
                    foreach ($order->items as $item) {
                        $subtotal += floatval($item->subtotal);
                    }
                    
                    $tax_total = 0; // Hardcoded 0 for now
                    $order->subtotal = $subtotal;
                    $order->tax_total = $tax_total;
                    $order->grand_total = $subtotal + $tax_total;
                }

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

                // Update Dining Table Status & Auto-Unmerge if applicable
                if ($order->dining_table_id) {
                    $table = \App\Models\DiningTable::find($order->dining_table_id);
                    if ($table) {
                        if ($order->status === 'Completed') {
                            $table->status = 'available';
                            
                            // Auto-unmerge all tables in this merge group
                            $targetParentId = $table->parent_table_id ?? $table->id;
                            \App\Models\DiningTable::where('parent_table_id', $targetParentId)->update(['parent_table_id' => null, 'status' => 'available']);
                            $table->parent_table_id = null;
                        } else if ($order->status === 'billed') {
                            $table->status = 'billed';
                        } else {
                            $table->status = 'occupied';
                        }
                        $table->save();
                    }
                }

                return ['order' => $order, 'recent_kot' => $recentKotPayload];
            });

            if ($result instanceof \Illuminate\Http\RedirectResponse) {
                return $result;
            }

            $order = $result['order'];
            $recentKot = $result['recent_kot'];
            $order->load(['items.menuItem', 'items.modifiers.modifier', 'location', 'cashier']);
            
            // Broadcast KOT only if there were new items
            if (!empty($validated['cart'])) {
                event(new \App\Events\OrderCreated($order));
            }
            
            // Redirect based on action and order type
            if ($validated['action'] === 'save_kot') {
                return back()->with([
                    'success' => "KOT Round #" . ($recentKot['round_number'] ?? 1) . " sent to kitchen.",
                    'recent_kot' => $recentKot
                ]);
            }

            if ($validated['action'] === 'print_bill') {
                return back()->with([
                    'success' => "Bill for {$order->order_number} generated.",
                    'recent_order' => $order,
                    'is_bill_only' => true
                ]);
            }

            if ($order->dining_table_id && $order->status === 'Completed') {
                return redirect()->route('pos.tables')->with([
                    'success' => "Order {$order->order_number} settled successfully.",
                    'recent_order' => $order,
                    'is_bill_only' => true
                ]);
            }

            return back()->with([
                'success' => "Order {$order->order_number} " . ($order->status === 'Completed' ? 'settled' : 'saved') . " successfully.",
                'recent_order' => $order,
                'recent_kot' => $recentKot
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
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

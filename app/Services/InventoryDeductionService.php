<?php

namespace App\Services;

use App\Models\InventoryBalance;
use App\Models\InventoryLedger;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\RecipeItem;
use App\Models\StorageLocation;
use App\Models\Ingredient;

class InventoryDeductionService
{
    /**
     * Deduct inventory for an individual order item and its modifiers.
     */
    public static function deductOrderItem(OrderItem $orderItem, string $businessLocationId, bool $allowOverride = true): void
    {
        // Prevent double deduction for the same order item
        $alreadyDeducted = InventoryLedger::where('reference_type', OrderItem::class)
            ->where('reference_id', $orderItem->id)
            ->where('transaction_type', 'sale')
            ->exists();

        if ($alreadyDeducted) {
            return;
        }

        // 1. Menu Item Recipes
        $menuItemRecipes = RecipeItem::where('menu_item_id', $orderItem->menu_item_id)->get();
        foreach ($menuItemRecipes as $recipe) {
            $quantity = (float) $recipe->quantity * (float) $orderItem->quantity;
            self::deductIngredient($recipe->ingredient_id, $businessLocationId, $quantity, $orderItem->id, $allowOverride);
        }

        // 2. Modifier Recipes
        $modifiers = $orderItem->modifiers()->with('modifier')->get();
        foreach ($modifiers as $mod) {
            $modRecipes = RecipeItem::where('modifier_id', $mod->modifier_id)->get();
            foreach ($modRecipes as $recipe) {
                $quantity = (float) $recipe->quantity * (float) $orderItem->quantity;
                self::deductIngredient($recipe->ingredient_id, $businessLocationId, $quantity, $orderItem->id, $allowOverride);
            }
        }
    }

    /**
     * Deduct ingredient stock from the optimal storage location (Kitchen preferred, or highest available stock).
     */
    public static function deductIngredient(string $ingredientId, string $businessLocationId, float $quantity, string $orderItemId, bool $allowOverride = true): void
    {
        if ($quantity <= 0) {
            return;
        }

        // Priority 1: Storage location in this branch with highest available stock for this ingredient
        $targetBalance = InventoryBalance::whereHas('storageLocation', function ($q) use ($businessLocationId) {
            $q->where('business_location_id', $businessLocationId);
        })
        ->where('ingredient_id', $ingredientId)
        ->orderByDesc('available_qty')
        ->first();

        // Priority 2: Storage location of type Kitchen or Kitchen in name
        if (!$targetBalance) {
            $storageLoc = StorageLocation::where('business_location_id', $businessLocationId)
                ->where(function ($q) {
                    $q->where('storage_type', 'Kitchen')
                      ->orWhere('storage_name', 'like', '%Kitchen%');
                })
                ->first()
                ?? StorageLocation::where('business_location_id', $businessLocationId)->first()
                ?? StorageLocation::firstOrCreate(
                    ['business_location_id' => $businessLocationId, 'storage_name' => 'Main Kitchen'],
                    ['storage_type' => 'Kitchen', 'status' => 1]
                );

            $targetBalance = InventoryBalance::firstOrCreate(
                ['ingredient_id' => $ingredientId, 'storage_location_id' => $storageLoc->id],
                ['available_qty' => 0, 'reserved_qty' => 0, 'on_order_qty' => 0]
            );
        }

        if ((float) $targetBalance->available_qty < $quantity && !$allowOverride) {
            $ingredient = Ingredient::find($ingredientId);
            throw new \Exception("Insufficient stock for ingredient: " . ($ingredient ? $ingredient->name : 'Unknown'));
        }

        $targetBalance->decrement('available_qty', $quantity);

        InventoryLedger::create([
            'business_location_id' => $businessLocationId,
            'storage_location_id' => $targetBalance->storage_location_id,
            'ingredient_id' => $ingredientId,
            'transaction_type' => 'sale',
            'reference_type' => OrderItem::class,
            'reference_id' => $orderItemId,
            'quantity' => -$quantity,
            'running_balance' => $targetBalance->fresh()->available_qty,
            'created_by' => auth()->id() ?? \App\Models\User::first()?->id,
        ]);
    }

    /**
     * Deduct inventory for all items in an entire Order if not already deducted.
     */
    public static function deductOrder(Order $order, bool $allowOverride = true): void
    {
        $order->load(['items.modifiers']);

        foreach ($order->items as $orderItem) {
            self::deductOrderItem($orderItem, $order->business_location_id, $allowOverride);
        }
    }

    /**
     * Revert inventory for all items in an entire Order.
     */
    public static function revertOrder(Order $order, bool $isWasted = false): void
    {
        $order->load(['items']);

        foreach ($order->items as $orderItem) {
            self::revertOrderItem($orderItem, $isWasted);
        }
    }

    /**
     * Revert inventory for an individual order item.
     */
    public static function revertOrderItem(OrderItem $orderItem, bool $isWasted = false): void
    {
        $deductions = InventoryLedger::where('reference_type', OrderItem::class)
            ->where('reference_id', $orderItem->id)
            ->where('transaction_type', 'sale')
            ->get();

        foreach ($deductions as $deduction) {
            $qtyToRevert = abs((float)$deduction->quantity);

            $balance = InventoryBalance::where('storage_location_id', $deduction->storage_location_id)
                ->where('ingredient_id', $deduction->ingredient_id)
                ->first();

            if ($balance) {
                // 1. Refund the sale
                $balance->increment('available_qty', $qtyToRevert);

                InventoryLedger::create([
                    'business_location_id' => $deduction->business_location_id,
                    'storage_location_id' => $deduction->storage_location_id,
                    'ingredient_id' => $deduction->ingredient_id,
                    'transaction_type' => 'sale_refund',
                    'reference_type' => OrderItem::class,
                    'reference_id' => $orderItem->id,
                    'quantity' => $qtyToRevert,
                    'running_balance' => $balance->fresh()->available_qty,
                    'created_by' => auth()->id() ?? \App\Models\User::first()?->id,
                ]);

                // 2. Log as wastage if applicable
                if ($isWasted) {
                    $balance->decrement('available_qty', $qtyToRevert);

                    InventoryLedger::create([
                        'business_location_id' => $deduction->business_location_id,
                        'storage_location_id' => $deduction->storage_location_id,
                        'ingredient_id' => $deduction->ingredient_id,
                        'transaction_type' => 'wastage',
                        'reference_type' => OrderItem::class,
                        'reference_id' => $orderItem->id,
                        'quantity' => -$qtyToRevert,
                        'running_balance' => $balance->fresh()->available_qty,
                        'created_by' => auth()->id() ?? \App\Models\User::first()?->id,
                    ]);
                }
            }
        }
    }
}

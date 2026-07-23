<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_transfer_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_transfer_order_id')->constrained('stock_transfer_orders')->cascadeOnDelete();
            $table->foreignId('ingredient_id')->constrained('ingredients');
            $table->decimal('approved_quantity', 10, 2);
            $table->decimal('dispatched_quantity', 10, 2)->default(0);
            $table->foreignId('uom_id')->constrained('units_of_measure');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_transfer_order_items');
    }
};

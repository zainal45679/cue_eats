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
        Schema::create('recipe_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('menu_item_id')->nullable()->constrained('menu_items')->nullOnDelete();
            $table->foreignUuid('modifier_id')->nullable()->constrained('modifiers')->nullOnDelete();
            $table->foreignUuid('ingredient_id')->constrained('ingredients')->cascadeOnDelete();
            $table->decimal('quantity', 10, 3);
            $table->foreignUuid('uom_id')->nullable()->constrained('units_of_measure')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recipe_items');
    }
};

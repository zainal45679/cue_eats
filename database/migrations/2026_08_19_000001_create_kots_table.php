<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pos_kots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pos_order_id')->constrained('pos_orders')->cascadeOnDelete();
            $table->integer('round_number')->default(1);
            $table->string('kot_number');
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('pos_kot_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pos_kot_id')->constrained('pos_kots')->cascadeOnDelete();
            $table->foreignUuid('menu_item_id')->constrained('menu_items')->cascadeOnDelete();
            $table->integer('quantity')->default(1);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('pos_kot_item_modifiers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pos_kot_item_id')->constrained('pos_kot_items')->cascadeOnDelete();
            $table->foreignUuid('modifier_id')->constrained('modifiers')->cascadeOnDelete();
            $table->decimal('price_adjustment', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::table('pos_order_items', function (Blueprint $table) {
            $table->integer('kot_round')->default(1)->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('pos_order_items', function (Blueprint $table) {
            $table->dropColumn('kot_round');
        });

        Schema::dropIfExists('pos_kot_item_modifiers');
        Schema::dropIfExists('pos_kot_items');
        Schema::dropIfExists('pos_kots');
    }
};

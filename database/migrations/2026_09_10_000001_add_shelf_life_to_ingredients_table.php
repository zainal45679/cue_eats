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
        Schema::table('ingredients', function (Blueprint $table) {
            $table->boolean('is_perishable')->default(false)->after('is_recipe_item');
            $table->unsignedInteger('shelf_life_days')->nullable()->after('is_perishable');
            $table->string('storage_condition')->nullable()->after('shelf_life_days'); // e.g. ambient, chilled, frozen
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ingredients', function (Blueprint $table) {
            $table->dropColumn(['is_perishable', 'shelf_life_days', 'storage_condition']);
        });
    }
};

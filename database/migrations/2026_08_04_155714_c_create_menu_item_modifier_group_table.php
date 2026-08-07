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
        Schema::create('menu_item_modifier_group', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid("menu_item_id")->constrained()->cascadeOnDelete();
            $table->foreignUuid("modifier_group_id")->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_item_modifier_group');
    }
};

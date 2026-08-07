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
        Schema::create('internal_request_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('internal_request_id')->constrained('internal_requests')->cascadeOnDelete();
            $table->foreignUuid('ingredient_id')->constrained('ingredients');
            $table->decimal('quantity', 10, 2);
            $table->foreignUuid('uom_id')->constrained('units_of_measure');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('internal_request_items');
    }
};

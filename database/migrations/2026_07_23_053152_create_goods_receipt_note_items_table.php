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
        Schema::create('goods_receipt_note_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('goods_receipt_note_id')->constrained('goods_receipt_notes')->cascadeOnDelete();
            $table->foreignUuid('ingredient_id')->constrained('ingredients');
            $table->decimal('expected_quantity', 10, 2);
            $table->decimal('received_quantity', 10, 2)->default(0);
            $table->decimal('rejected_quantity', 10, 2)->default(0);
            $table->foreignUuid('uom_id')->constrained('units_of_measure');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('goods_receipt_note_items');
    }
};

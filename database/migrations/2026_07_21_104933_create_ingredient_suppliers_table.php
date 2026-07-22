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
        Schema::create('ingredient_suppliers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('ingredient_id')->constrained('ingredients')->cascadeOnDelete();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->foreignId('purchase_uom_id')->constrained('units_of_measure')->cascadeOnDelete();
            $table->decimal('moq', 10, 2)->default(1);
            $table->decimal('price', 15, 4)->default(0);
            $table->foreignId('currency_tax_id')->nullable()->constrained('currency_taxes')->nullOnDelete();
            $table->integer('lead_time_days')->default(1);
            $table->boolean('is_preferred')->default(false);
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['ingredient_id', 'supplier_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ingredient_suppliers');
    }
};

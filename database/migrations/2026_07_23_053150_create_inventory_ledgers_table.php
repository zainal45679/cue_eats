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
        Schema::create('inventory_ledgers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_location_id')->constrained('business_locations');
            $table->foreignUuid('ingredient_id')->constrained('ingredients');
            $table->string('transaction_type');
            $table->string('reference_type')->nullable();
            $table->uuid('reference_id')->nullable();
            $table->decimal('quantity', 10, 2);
            $table->decimal('running_balance', 10, 2);
            $table->foreignUuid('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_ledgers');
    }
};

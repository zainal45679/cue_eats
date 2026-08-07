<?php

declare(strict_types=1);

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
        Schema::create('business_locations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('uuid')->unique();
            $table->foreignUuid('country_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('parent_location_id')->nullable()->constrained('business_locations')->nullOnDelete();
            $table->string('location_name');
            $table->string('location_code')->nullable();
            $table->string('location_type');
            $table->boolean('is_parent_location')->default(false);
            $table->boolean('is_inventory_location')->default(true);
            $table->boolean('is_purchasing_enabled')->default(true);
            $table->boolean('is_sales_enabled')->default(true);
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_locations');
    }
};

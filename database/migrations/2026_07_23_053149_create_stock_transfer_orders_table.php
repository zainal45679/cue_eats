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
        Schema::create('stock_transfer_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('uuid')->unique();
            $table->foreignUuid('internal_request_id')->constrained('internal_requests');
            $table->string('sto_number')->unique();
            $table->foreignUuid('from_location_id')->constrained('business_locations');
            $table->foreignUuid('to_location_id')->constrained('business_locations');
            $table->string('status')->default('pending_dispatch');
            $table->timestamp('dispatched_at')->nullable();
            $table->foreignUuid('created_by')->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_transfer_orders');
    }
};

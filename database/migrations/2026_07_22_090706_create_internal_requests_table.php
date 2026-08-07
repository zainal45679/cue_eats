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
        Schema::create('internal_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid();
            $table->string('request_number')->unique();
            $table->foreignUuid('from_location_id')->constrained('business_locations'); // Requester
            $table->foreignUuid('to_location_id')->nullable()->constrained('business_locations'); // Fulfiller (Central Warehouse)
            $table->foreignUuid('requested_by_id')->constrained('users');
            $table->string('status')->default('draft'); // draft, pending, approved, rejected, dispatched, fulfilled, cancelled
            $table->text('remarks')->nullable();
            $table->foreignUuid('created_by')->nullable()->constrained('users');
            $table->foreignUuid('updated_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('internal_requests');
    }
};

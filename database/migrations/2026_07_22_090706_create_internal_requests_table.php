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
            $table->id();
            $table->uuid();
            $table->string('request_number')->unique();
            $table->foreignId('from_location_id')->constrained('business_locations'); // Requester
            $table->foreignId('to_location_id')->nullable()->constrained('business_locations'); // Fulfiller (Central Warehouse)
            $table->foreignId('requested_by_id')->constrained('users');
            $table->string('status')->default('draft'); // draft, pending, approved, rejected, dispatched, fulfilled, cancelled
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
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

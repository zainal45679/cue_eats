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
        Schema::create('goods_receipt_notes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('uuid')->unique();
            $table->foreignUuid('stock_transfer_order_id')->nullable()->constrained('stock_transfer_orders');
            $table->foreignUuid('purchase_order_id')->nullable()->constrained('purchase_orders');
            $table->string('grn_number')->unique();
            $table->foreignUuid('location_id')->constrained('business_locations');
            $table->foreignUuid('received_by_id')->constrained('users');
            $table->string('status')->default('draft');
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('goods_receipt_notes');
    }
};

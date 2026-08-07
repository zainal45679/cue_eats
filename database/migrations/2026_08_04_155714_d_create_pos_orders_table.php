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
        Schema::create('pos_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string("order_number")->unique();
            $table->foreignUuid("business_location_id")->constrained()->cascadeOnDelete();
            $table->foreignUuid("user_id")->nullable()->constrained()->nullOnDelete();
            $table->string("customer_name")->nullable();
            $table->string("order_type")->default("Takeaway");
            $table->string("status")->default("Pending");
            $table->decimal("subtotal", 10, 2)->default(0);
            $table->decimal("tax_total", 10, 2)->default(0);
            $table->decimal("discount_total", 10, 2)->default(0);
            $table->decimal("grand_total", 10, 2)->default(0);
            $table->string("payment_method")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pos_orders');
    }
};

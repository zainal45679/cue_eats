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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->uuid();
            $table->string('po_number')->unique();
            $table->foreignId('business_location_id')->constrained('business_locations'); // The branch making the purchase
            $table->foreignId('supplier_id')->constrained('suppliers');
            $table->foreignId('delivery_location_id')->nullable()->constrained('business_locations'); // Where it should be delivered
            $table->date('expected_delivery_date')->nullable();
            $table->string('status')->default('draft'); // draft, pending_approval, approved, rejected, ordered, partially_received, received, cancelled
            $table->text('notes')->nullable();
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax_total', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2)->default(0);
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
        Schema::dropIfExists('purchase_orders');
    }
};

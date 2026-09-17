<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_lots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ingredient_id')->constrained('ingredients');
            $table->foreignUuid('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->foreignUuid('source_grn_item_id')->nullable()->unique()->constrained('goods_receipt_note_items')->nullOnDelete();
            $table->string('internal_lot_number')->unique();
            $table->string('batch_number')->nullable();
            $table->date('mfg_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->string('status')->default('available');
            $table->string('traceability_status')->default('verified');
            $table->timestamps();

            $table->index(['ingredient_id', 'expiry_date', 'status']);
            $table->index(['ingredient_id', 'batch_number']);
        });

        Schema::create('inventory_lot_balances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('inventory_lot_id')->constrained('inventory_lots')->cascadeOnDelete();
            $table->foreignUuid('storage_location_id')->constrained('storage_locations')->cascadeOnDelete();
            $table->decimal('available_qty', 12, 3)->default(0);
            $table->decimal('reserved_qty', 12, 3)->default(0);
            $table->timestamps();

            $table->unique(['inventory_lot_id', 'storage_location_id'], 'lot_storage_unique');
        });

        Schema::create('inventory_lot_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('inventory_lot_id')->constrained('inventory_lots');
            $table->foreignUuid('from_storage_location_id')->nullable()->constrained('storage_locations')->nullOnDelete();
            $table->foreignUuid('to_storage_location_id')->nullable()->constrained('storage_locations')->nullOnDelete();
            $table->string('movement_type');
            $table->decimal('quantity', 12, 3);
            $table->string('reference_type')->nullable();
            $table->uuid('reference_id')->nullable();
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reason')->nullable();
            $table->timestamps();

            $table->index(['inventory_lot_id', 'created_at']);
            $table->index(['reference_type', 'reference_id']);
        });

        Schema::create('stock_transfer_lot_allocations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('stock_transfer_order_item_id');
            $table->foreign('stock_transfer_order_item_id', 'stla_sto_item_fk')
                ->references('id')
                ->on('stock_transfer_order_items')
                ->cascadeOnDelete();
            $table->foreignUuid('inventory_lot_id')->constrained('inventory_lots');
            $table->foreignUuid('from_storage_location_id')->constrained('storage_locations');
            $table->decimal('dispatched_quantity', 12, 3);
            $table->decimal('received_quantity', 12, 3)->default(0);
            $table->decimal('rejected_quantity', 12, 3)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_transfer_lot_allocations');
        Schema::dropIfExists('inventory_lot_movements');
        Schema::dropIfExists('inventory_lot_balances');
        Schema::dropIfExists('inventory_lots');
    }
};

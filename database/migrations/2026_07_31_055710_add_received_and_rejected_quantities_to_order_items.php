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
        Schema::table('stock_transfer_order_items', function (Blueprint $table) {
            $table->decimal('received_quantity', 10, 2)->default(0)->after('dispatched_quantity');
            $table->decimal('rejected_quantity', 10, 2)->default(0)->after('received_quantity');
        });

        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->decimal('rejected_quantity', 10, 2)->default(0)->after('received_quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_transfer_order_items', function (Blueprint $table) {
            $table->dropColumn(['received_quantity', 'rejected_quantity']);
        });

        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->dropColumn('rejected_quantity');
        });
    }
};

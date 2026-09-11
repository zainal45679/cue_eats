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
        Schema::table('goods_receipt_note_items', function (Blueprint $table) {
            $table->string('batch_number')->nullable()->after('rejected_quantity');
            $table->date('mfg_date')->nullable()->after('batch_number');
            $table->date('expiry_date')->nullable()->after('mfg_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('goods_receipt_note_items', function (Blueprint $table) {
            $table->dropColumn(['batch_number', 'mfg_date', 'expiry_date']);
        });
    }
};

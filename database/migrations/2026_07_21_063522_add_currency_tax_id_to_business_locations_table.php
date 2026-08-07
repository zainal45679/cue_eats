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
        Schema::table('business_locations', function (Blueprint $table) {
            $table->foreignUuid('currency_tax_id')->nullable()->constrained('currency_taxes')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('business_locations', function (Blueprint $table) {
            $table->dropForeign(['currency_tax_id']);
            $table->dropColumn('currency_tax_id');
        });
    }
};

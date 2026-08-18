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
        if (!Schema::hasColumn('inventory_ledgers', 'storage_location_id')) {
            Schema::table('inventory_ledgers', function (Blueprint $table) {
                $table->foreignUuid('storage_location_id')->nullable()->after('business_location_id')->constrained('storage_locations')->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('inventory_ledgers', 'storage_location_id')) {
            Schema::table('inventory_ledgers', function (Blueprint $table) {
                $table->dropForeign(['storage_location_id']);
                $table->dropColumn('storage_location_id');
            });
        }
    }
};

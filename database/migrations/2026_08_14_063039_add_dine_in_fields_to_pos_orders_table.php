<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pos_orders', function (Blueprint $table) {
            $table->foreignUuid('dining_table_id')->nullable()->after('business_location_id')->constrained()->nullOnDelete();
            $table->foreignUuid('waiter_id')->nullable()->after('dining_table_id')->constrained('users')->nullOnDelete();
            $table->integer('pax')->nullable()->after('waiter_id');
            // status can be running, billed, Completed, cancelled (existing is string)
            // We just leave status as is, since it's a string column. We will just use 'running' and 'billed' strings.
        });
    }

    public function down(): void
    {
        Schema::table('pos_orders', function (Blueprint $table) {
            $table->dropForeign(['dining_table_id']);
            $table->dropForeign(['waiter_id']);
            $table->dropColumn(['dining_table_id', 'waiter_id', 'pax']);
        });
    }
};

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
        Schema::table('dining_tables', function (Blueprint $table) {
            $table->foreignUuid('parent_table_id')->nullable()->after('id')->constrained('dining_tables')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dining_tables', function (Blueprint $table) {
            $table->dropForeign(['parent_table_id']);
            $table->dropColumn('parent_table_id');
        });
    }
};

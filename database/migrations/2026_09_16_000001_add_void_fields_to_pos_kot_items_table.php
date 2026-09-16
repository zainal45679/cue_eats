<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pos_kot_items', function (Blueprint $table) {
            $table->boolean('is_voided')->default(false)->after('notes');
            $table->string('void_reason')->nullable()->after('is_voided');
            $table->timestamp('voided_at')->nullable()->after('void_reason');
            $table->foreignUuid('voided_by')->nullable()->after('voided_at')->constrained('users')->nullOnDelete();
        });

        Schema::table('pos_order_items', function (Blueprint $table) {
            $table->boolean('is_voided')->default(false)->after('kot_round');
            $table->string('void_reason')->nullable()->after('is_voided');
            $table->timestamp('voided_at')->nullable()->after('void_reason');
            $table->foreignUuid('voided_by')->nullable()->after('voided_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pos_kot_items', function (Blueprint $table) {
            $table->dropForeign(['voided_by']);
            $table->dropColumn(['is_voided', 'void_reason', 'voided_at', 'voided_by']);
        });

        Schema::table('pos_order_items', function (Blueprint $table) {
            $table->dropForeign(['voided_by']);
            $table->dropColumn(['is_voided', 'void_reason', 'voided_at', 'voided_by']);
        });
    }
};

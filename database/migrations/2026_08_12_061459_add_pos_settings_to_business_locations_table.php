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
            $table->string('service_type')->default('qsr')->after('is_sales_enabled');
            $table->string('kitchen_workflow')->default('print_only')->after('service_type');
            $table->text('receipt_header')->nullable()->after('kitchen_workflow');
            $table->text('receipt_footer')->nullable()->after('receipt_header');
            $table->text('address')->nullable()->after('receipt_footer');
            $table->string('phone')->nullable()->after('address');
            $table->string('email')->nullable()->after('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('business_locations', function (Blueprint $table) {
            $table->dropColumn([
                'service_type',
                'kitchen_workflow',
                'receipt_header',
                'receipt_footer',
                'address',
                'phone',
                'email',
            ]);
        });
    }
};

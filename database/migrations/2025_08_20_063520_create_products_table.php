<?php

declare(strict_types=1);

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
        Schema::create('products', function (Blueprint $table): void {
            // Primary Fields
            $table->id();
            $table->uuid();

            // Details Fields
            $table->string('name');
            $table->string('type');
            $table->string('category');
            $table->string('image')->nullable();
            $table->decimal('litres');
            $table->tinyInteger('status')->default(1)->comment('1: Active, 0: Inactive');

            // Audit Fields
            $table->foreignId('created_by')->nullable()->comment('0: System')->constrained('users')->noActionOnUpdate()->noActionOnDelete();
            $table->foreignId('updated_by')->nullable()->comment('0: System')->constrained('users')->noActionOnUpdate()->noActionOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dining_tables', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('dining_zone_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->integer('seating_capacity')->default(4);
            $table->string('status')->default('available'); // available, occupied, billed
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dining_tables');
    }
};

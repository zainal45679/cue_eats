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
        // 1. Kitchen Stations
        if (!Schema::hasTable('kitchen_stations')) {
            Schema::create('kitchen_stations', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignUuid('business_location_id')->nullable()->constrained('business_locations')->nullOnDelete();
                $table->string('name');
                $table->string('code')->nullable();
                $table->string('printer_ip')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 2. Menu Categories (Add Parent ID for sub-categories, order types)
        Schema::table('menu_categories', function (Blueprint $table) {
            if (!Schema::hasColumn('menu_categories', 'parent_id')) {
                $table->foreignUuid('parent_id')->nullable()->after('id')->constrained('menu_categories')->nullOnDelete();
            }
            if (!Schema::hasColumn('menu_categories', 'available_order_types')) {
                $table->json('available_order_types')->nullable()->after('sort_order');
            }
        });

        // 3. Menu Items (Add item code, dietary flags, spice level, tags, tax mapping, kitchen station, channel prices)
        Schema::table('menu_items', function (Blueprint $table) {
            if (!Schema::hasColumn('menu_items', 'item_code')) {
                $table->string('item_code')->nullable()->after('menu_category_id')->index();
            }
            if (!Schema::hasColumn('menu_items', 'sub_category_id')) {
                $table->foreignUuid('sub_category_id')->nullable()->after('menu_category_id')->constrained('menu_categories')->nullOnDelete();
            }
            if (!Schema::hasColumn('menu_items', 'food_type')) {
                $table->string('food_type')->default('veg')->after('price'); // veg, non_veg, egg, vegan
            }
            if (!Schema::hasColumn('menu_items', 'spice_level')) {
                $table->integer('spice_level')->default(0)->after('food_type'); // 0=None, 1=Mild, 2=Medium, 3=Hot
            }
            if (!Schema::hasColumn('menu_items', 'is_chef_special')) {
                $table->boolean('is_chef_special')->default(false)->after('spice_level');
            }
            if (!Schema::hasColumn('menu_items', 'is_best_seller')) {
                $table->boolean('is_best_seller')->default(false)->after('is_chef_special');
            }
            if (!Schema::hasColumn('menu_items', 'is_jain')) {
                $table->boolean('is_jain')->default(false)->after('is_best_seller');
            }
            if (!Schema::hasColumn('menu_items', 'is_tax_inclusive')) {
                $table->boolean('is_tax_inclusive')->default(false)->after('is_jain');
            }
            if (!Schema::hasColumn('menu_items', 'tax_rate')) {
                $table->decimal('tax_rate', 5, 2)->default(5.00)->after('is_tax_inclusive');
            }
            if (!Schema::hasColumn('menu_items', 'kitchen_station_id')) {
                $table->foreignUuid('kitchen_station_id')->nullable()->after('tax_rate')->constrained('kitchen_stations')->nullOnDelete();
            }
            if (!Schema::hasColumn('menu_items', 'channel_prices')) {
                $table->json('channel_prices')->nullable()->after('kitchen_station_id');
            }
            if (!Schema::hasColumn('menu_items', 'has_variants')) {
                $table->boolean('has_variants')->default(false)->after('channel_prices');
            }
        });

        // 4. Menu Item Variants (Sizes/Portions e.g. Small, Medium, Large, Half, Full)
        if (!Schema::hasTable('menu_item_variants')) {
            Schema::create('menu_item_variants', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignUuid('menu_item_id')->constrained('menu_items')->cascadeOnDelete();
                $table->string('name'); // e.g. Regular, Medium, Large, Half, Full
                $table->decimal('price', 10, 2);
                $table->string('item_code')->nullable()->index();
                $table->boolean('is_available')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // 5. Outlet Menu Item Overrides (Branch-specific price and availability overrides)
        if (!Schema::hasTable('outlet_menu_item_overrides')) {
            Schema::create('outlet_menu_item_overrides', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignUuid('business_location_id')->constrained('business_locations')->cascadeOnDelete();
                $table->foreignUuid('menu_item_id')->constrained('menu_items')->cascadeOnDelete();
                $table->decimal('price', 10, 2)->nullable();
                $table->boolean('is_available')->default(true);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->unique(['business_location_id', 'menu_item_id'], 'outlet_item_unique');
            });
        }

        // 6. Menu Combos & Combo Choice Items
        if (!Schema::hasTable('menu_combos')) {
            Schema::create('menu_combos', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('name');
                $table->text('description')->nullable();
                $table->decimal('price', 10, 2);
                $table->string('image')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('menu_combo_items')) {
            Schema::create('menu_combo_items', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignUuid('menu_combo_id')->constrained('menu_combos')->cascadeOnDelete();
                $table->foreignUuid('menu_item_id')->constrained('menu_items')->cascadeOnDelete();
                $table->integer('quantity')->default(1);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_combo_items');
        Schema::dropIfExists('menu_combos');
        Schema::dropIfExists('outlet_menu_item_overrides');
        Schema::dropIfExists('menu_item_variants');

        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropColumn([
                'item_code', 'sub_category_id', 'food_type', 'spice_level',
                'is_chef_special', 'is_best_seller', 'is_jain', 'is_tax_inclusive',
                'tax_rate', 'kitchen_station_id', 'channel_prices', 'has_variants'
            ]);
        });

        Schema::table('menu_categories', function (Blueprint $table) {
            $table->dropColumn(['parent_id', 'available_order_types']);
        });

        Schema::dropIfExists('kitchen_stations');
    }
};

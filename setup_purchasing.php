<?php

$migrations = [
    'internal_requests' => <<<SCHEMA
            \$table->id();
            \$table->uuid();
            \$table->string('request_number')->unique();
            \$table->foreignId('from_location_id')->constrained('business_locations'); // Requester
            \$table->foreignId('to_location_id')->nullable()->constrained('business_locations'); // Fulfiller (Central Warehouse)
            \$table->foreignId('requested_by_id')->constrained('users');
            \$table->string('status')->default('draft'); // draft, pending, approved, rejected, dispatched, fulfilled, cancelled
            \$table->text('remarks')->nullable();
            \$table->foreignId('created_by')->nullable()->constrained('users');
            \$table->foreignId('updated_by')->nullable()->constrained('users');
            \$table->timestamps();
            \$table->softDeletes();
SCHEMA,
    'internal_request_items' => <<<SCHEMA
            \$table->id();
            \$table->foreignId('internal_request_id')->constrained('internal_requests')->cascadeOnDelete();
            \$table->foreignId('ingredient_id')->constrained('ingredients');
            \$table->decimal('quantity', 10, 2);
            \$table->foreignId('uom_id')->constrained('units_of_measure');
            \$table->timestamps();
SCHEMA,
    'purchase_orders' => <<<SCHEMA
            \$table->id();
            \$table->uuid();
            \$table->string('po_number')->unique();
            \$table->foreignId('business_location_id')->constrained('business_locations'); // The branch making the purchase
            \$table->foreignId('supplier_id')->constrained('suppliers');
            \$table->foreignId('delivery_location_id')->nullable()->constrained('business_locations'); // Where it should be delivered
            \$table->date('expected_delivery_date')->nullable();
            \$table->string('status')->default('draft'); // draft, pending_approval, approved, rejected, ordered, partially_received, received, cancelled
            \$table->text('notes')->nullable();
            \$table->decimal('subtotal', 15, 2)->default(0);
            \$table->decimal('tax_total', 15, 2)->default(0);
            \$table->decimal('grand_total', 15, 2)->default(0);
            \$table->foreignId('created_by')->nullable()->constrained('users');
            \$table->foreignId('updated_by')->nullable()->constrained('users');
            \$table->timestamps();
            \$table->softDeletes();
SCHEMA,
    'purchase_order_items' => <<<SCHEMA
            \$table->id();
            \$table->foreignId('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
            \$table->foreignId('ingredient_id')->constrained('ingredients');
            \$table->decimal('quantity', 10, 2);
            \$table->foreignId('purchase_uom_id')->constrained('units_of_measure');
            \$table->decimal('unit_price', 15, 2)->default(0);
            \$table->decimal('tax_amount', 15, 2)->default(0);
            \$table->integer('lead_time_days')->default(0);
            \$table->timestamps();
SCHEMA,
    'purchase_order_approvals' => <<<SCHEMA
            \$table->id();
            \$table->foreignId('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
            \$table->foreignId('approver_id')->constrained('users');
            \$table->string('status')->default('pending'); // pending, approved, rejected
            \$table->text('comments')->nullable();
            \$table->timestamp('acted_at')->nullable();
            \$table->timestamps();
SCHEMA,
];

foreach (glob('database/migrations/2026_07_22_090706_create_*.php') as \$file) {
    \$content = file_get_contents(\$file);
    foreach (\$migrations as \$table => \$schema) {
        if (str_contains(\$file, "create_{\$table}_table")) {
            \$content = preg_replace('/Schema::create\(\'' . \$table . '\', function \(Blueprint \$table\) \{(.*?)\}\);/s', "Schema::create('\$table', function (Blueprint \$table) {\n\$schema\n        });", \$content);
            file_put_contents(\$file, \$content);
            echo "Updated \$file\n";
        }
    }
}

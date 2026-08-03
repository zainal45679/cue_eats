<?php
use Illuminate\Support\Facades\DB;

DB::statement('SET FOREIGN_KEY_CHECKS=0;');
DB::table('goods_receipt_note_items')->truncate();
DB::table('goods_receipt_notes')->truncate();
DB::table('stock_transfer_order_items')->truncate();
DB::table('stock_transfer_orders')->truncate();
DB::table('internal_request_items')->truncate();
DB::table('internal_requests')->truncate();
DB::table('inventory_ledgers')->truncate();
DB::table('inventory_balances')->update(['available_qty' => 1000, 'reserved_qty' => 0]);
DB::statement('SET FOREIGN_KEY_CHECKS=1;');
echo "Cleaned successfully.\n";

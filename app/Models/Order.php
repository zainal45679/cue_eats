<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;



class Order extends Model
{
    use HasUuids;
    protected $table = 'pos_orders';
    protected $fillable = ['order_number', 'business_location_id', 'user_id', 'customer_name', 'order_type', 'status', 'kitchen_status', 'rejection_reason', 'subtotal', 'tax_total', 'discount_total', 'grand_total', 'payment_method', 'dining_table_id', 'waiter_id', 'pax'];

    public function items() { return $this->hasMany(OrderItem::class, 'pos_order_id'); }
    public function location() { return $this->belongsTo(BusinessLocation::class, 'business_location_id'); }
    public function cashier() { return $this->belongsTo(User::class, 'user_id'); }
    
    public function diningTable() { return $this->belongsTo(DiningTable::class, 'dining_table_id'); }
    public function waiter() { return $this->belongsTo(User::class, 'waiter_id'); }
    public function kots() { return $this->hasMany(PosKot::class, 'pos_order_id')->orderBy('round_number', 'asc'); }
}

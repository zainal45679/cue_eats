<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;



class Order extends Model
{
    use HasUuids;
    protected $table = 'pos_orders';
    protected $fillable = ['order_number', 'business_location_id', 'user_id', 'customer_name', 'order_type', 'status', 'subtotal', 'tax_total', 'discount_total', 'grand_total', 'payment_method'];

    public function items() { return $this->hasMany(OrderItem::class, 'pos_order_id'); }
    public function location() { return $this->belongsTo(BusinessLocation::class, 'business_location_id'); }
    public function cashier() { return $this->belongsTo(User::class, 'user_id'); }

}

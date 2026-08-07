<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;



class OrderItem extends Model
{
    use HasUuids;
    protected $table = 'pos_order_items';
    protected $fillable = ['pos_order_id', 'menu_item_id', 'quantity', 'unit_price', 'subtotal', 'notes'];

    public function order() { return $this->belongsTo(Order::class, 'pos_order_id'); }
    public function menuItem() { return $this->belongsTo(MenuItem::class); }
    public function modifiers() { return $this->hasMany(OrderItemModifier::class, 'pos_order_item_id'); }

}

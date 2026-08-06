<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItemModifier extends Model
{
    protected $table = 'pos_order_item_modifiers';
    protected $fillable = ['pos_order_item_id', 'modifier_id', 'price_adjustment'];

    public function orderItem() { return $this->belongsTo(OrderItem::class, 'pos_order_item_id'); }
    public function modifier() { return $this->belongsTo(Modifier::class); }

}

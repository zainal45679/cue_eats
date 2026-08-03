<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockTransferOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'stock_transfer_order_id',
        'ingredient_id',
        'approved_quantity',
        'dispatched_quantity',
        'received_quantity',
        'rejected_quantity',
        'uom_id',
    ];

    public function stockTransferOrder(): BelongsTo
    {
        return $this->belongsTo(StockTransferOrder::class);
    }

    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function unitOfMeasure(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'uom_id');
    }
}

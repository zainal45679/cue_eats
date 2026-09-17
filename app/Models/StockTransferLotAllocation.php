<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class StockTransferLotAllocation extends Model
{
    use HasUuids;

    protected $fillable = [
        'stock_transfer_order_item_id',
        'inventory_lot_id',
        'from_storage_location_id',
        'dispatched_quantity',
        'received_quantity',
        'rejected_quantity',
    ];

    protected $casts = [
        'dispatched_quantity' => 'decimal:3',
        'received_quantity' => 'decimal:3',
        'rejected_quantity' => 'decimal:3',
    ];

    public function lot(): BelongsTo
    {
        return $this->belongsTo(InventoryLot::class, 'inventory_lot_id');
    }

    public function stockTransferOrderItem(): BelongsTo
    {
        return $this->belongsTo(StockTransferOrderItem::class);
    }
}

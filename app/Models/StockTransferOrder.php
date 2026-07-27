<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockTransferOrder extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'internal_request_id',
        'sto_number',
        'from_location_id',
        'to_location_id',
        'status',
        'dispatched_at',
        'created_by',
    ];

    public function internalRequest(): BelongsTo
    {
        return $this->belongsTo(InternalRequest::class);
    }

    public function fromLocation(): BelongsTo
    {
        return $this->belongsTo(BusinessLocation::class, 'from_location_id');
    }

    public function toLocation(): BelongsTo
    {
        return $this->belongsTo(BusinessLocation::class, 'to_location_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(StockTransferOrderItem::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function grns(): HasMany
    {
        return $this->hasMany(GoodsReceiptNote::class, 'stock_transfer_order_id');
    }
}

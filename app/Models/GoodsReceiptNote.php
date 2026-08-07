<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;



class GoodsReceiptNote extends Model
{
    use HasUuids;
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'stock_transfer_order_id',
        'purchase_order_id',
        'grn_number',
        'location_id',
        'received_by_id',
        'status',
        'remarks',
    ];

    public function stockTransferOrder(): BelongsTo
    {
        return $this->belongsTo(StockTransferOrder::class);
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(BusinessLocation::class, 'location_id');
    }

    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by_id')->withoutGlobalScope(\App\Models\Scopes\TenantScope::class)->withTrashed();
    }

    public function items(): HasMany
    {
        return $this->hasMany(GoodsReceiptNoteItem::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;



class GoodsReceiptNoteItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'goods_receipt_note_id',
        'ingredient_id',
        'expected_quantity',
        'received_quantity',
        'rejected_quantity',
        'batch_number',
        'mfg_date',
        'expiry_date',
        'uom_id',
    ];

    protected $casts = [
        'mfg_date' => 'date',
        'expiry_date' => 'date',
    ];

    public function goodsReceiptNote(): BelongsTo
    {
        return $this->belongsTo(GoodsReceiptNote::class);
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

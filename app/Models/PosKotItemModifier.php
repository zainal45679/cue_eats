<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PosKotItemModifier extends Model
{
    use HasUuids;

    protected $table = 'pos_kot_item_modifiers';
    protected $fillable = ['pos_kot_item_id', 'modifier_id', 'price_adjustment'];

    public function kotItem(): BelongsTo
    {
        return $this->belongsTo(PosKotItem::class, 'pos_kot_item_id');
    }

    public function modifier(): BelongsTo
    {
        return $this->belongsTo(Modifier::class, 'modifier_id');
    }
}

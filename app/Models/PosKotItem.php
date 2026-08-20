<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PosKotItem extends Model
{
    use HasUuids;

    protected $table = 'pos_kot_items';
    protected $fillable = ['pos_kot_id', 'menu_item_id', 'quantity', 'notes'];

    public function kot(): BelongsTo
    {
        return $this->belongsTo(PosKot::class, 'pos_kot_id');
    }

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id');
    }

    public function modifiers(): HasMany
    {
        return $this->hasMany(PosKotItemModifier::class, 'pos_kot_item_id');
    }
}

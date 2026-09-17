<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class InventoryLot extends Model
{
    use HasUuids;

    protected $fillable = [
        'ingredient_id',
        'supplier_id',
        'source_grn_item_id',
        'internal_lot_number',
        'batch_number',
        'mfg_date',
        'expiry_date',
        'received_at',
        'status',
        'traceability_status',
    ];

    protected $casts = [
        'mfg_date' => 'date',
        'expiry_date' => 'date',
        'received_at' => 'datetime',
    ];

    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function balances(): HasMany
    {
        return $this->hasMany(InventoryLotBalance::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(InventoryLotMovement::class);
    }
}

<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

final class InventoryLotMovement extends Model
{
    use HasUuids;

    protected $fillable = [
        'inventory_lot_id',
        'from_storage_location_id',
        'to_storage_location_id',
        'movement_type',
        'quantity',
        'reference_type',
        'reference_id',
        'created_by',
        'reason',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
    ];

    public function lot(): BelongsTo
    {
        return $this->belongsTo(InventoryLot::class, 'inventory_lot_id');
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}

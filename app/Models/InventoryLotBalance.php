<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class InventoryLotBalance extends Model
{
    use HasUuids;

    protected $fillable = [
        'inventory_lot_id',
        'storage_location_id',
        'available_qty',
        'reserved_qty',
    ];

    protected $casts = [
        'available_qty' => 'decimal:3',
        'reserved_qty' => 'decimal:3',
    ];

    public function lot(): BelongsTo
    {
        return $this->belongsTo(InventoryLot::class, 'inventory_lot_id');
    }

    public function storageLocation(): BelongsTo
    {
        return $this->belongsTo(StorageLocation::class);
    }
}

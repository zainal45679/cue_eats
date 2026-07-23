<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryBalance extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'ingredient_id',
        'storage_location_id',
        'available_qty',
        'reserved_qty',
        'on_order_qty',
    ];

    protected $casts = [
        'available_qty' => 'decimal:3',
        'reserved_qty' => 'decimal:3',
        'on_order_qty' => 'decimal:3',
    ];

    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function storageLocation(): BelongsTo
    {
        return $this->belongsTo(StorageLocation::class);
    }
}

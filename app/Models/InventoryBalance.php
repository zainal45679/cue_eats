<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class InventoryBalance extends Model
{
    use HasFactory;

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

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function storageLocation(): BelongsTo
    {
        return $this->belongsTo(StorageLocation::class);
    }
}

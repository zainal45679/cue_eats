<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;



class UnitOfMeasure extends Model
{
    use HasFactory, HasUuids;
    use HasUuid;

    protected $table = 'units_of_measure';

    protected $fillable = [
        'name',
        'code',
        'type',
        'base_unit_id',
        'conversion_factor',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
        'conversion_factor' => 'decimal:4',
    ];

    public function baseUnit(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'base_unit_id');
    }

    public function subUnits(): HasMany
    {
        return $this->hasMany(UnitOfMeasure::class, 'base_unit_id');
    }
}

<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class CurrencyTax extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'country_id',
        'currency',
        'tax_type',
        'tax_percentage',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
        'tax_percentage' => 'decimal:2',
    ];

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }
}

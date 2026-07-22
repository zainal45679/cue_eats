<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperCountry
 */
final class Country extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = ['name', 'status'];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function currencyTax(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CurrencyTax::class);
    }
}

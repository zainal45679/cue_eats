<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class BusinessLocation extends Model
{
    use HasUuids;
    use HasFactory, HasUuid;

    protected $fillable = [
        'country_id',
        'parent_location_id',
        'location_name',
        'location_code',
        'location_type',
        'currency_tax_id',
        'is_parent_location',
        'is_inventory_location',
        'is_purchasing_enabled',
        'is_sales_enabled',
        'service_type',
        'kitchen_workflow',
        'receipt_header',
        'receipt_footer',
        'address',
        'phone',
        'email',
        'status',
    ];

    protected $casts = [
        'is_parent_location' => 'boolean',
        'is_inventory_location' => 'boolean',
        'is_purchasing_enabled' => 'boolean',
        'is_sales_enabled' => 'boolean',
        'status' => 'boolean',
    ];

    public function taxProfile(): BelongsTo
    {
        return $this->belongsTo(CurrencyTax::class, 'currency_tax_id');
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function parentLocation(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_location_id');
    }

    public function childLocations(): HasMany
    {
        return $this->hasMany(self::class, 'parent_location_id');
    }

    public function storageLocations(): HasMany
    {
        return $this->hasMany(StorageLocation::class);
    }
}

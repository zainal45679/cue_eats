<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class IngredientSupplier extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'ingredient_id',
        'supplier_id',
        'purchase_uom_id',
        'moq',
        'price',
        'currency_tax_id',
        'lead_time_days',
        'is_preferred',
        'status',
    ];

    protected $casts = [
        'moq' => 'decimal:2',
        'price' => 'decimal:4',
        'is_preferred' => 'boolean',
        'status' => 'boolean',
    ];

    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function purchaseUom(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'purchase_uom_id');
    }

    public function currencyTax(): BelongsTo
    {
        return $this->belongsTo(CurrencyTax::class, 'currency_tax_id');
    }
}

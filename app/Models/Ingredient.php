<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;



class Ingredient extends Model
{
    use HasUuids;
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'ingredient_category_id',
        'base_uom_id',
        'brand_id',
        'is_inventory_item',
        'is_purchasable',
        'is_recipe_item',
        'status',
    ];

    protected $casts = [
        'is_inventory_item' => 'boolean',
        'is_purchasable' => 'boolean',
        'is_recipe_item' => 'boolean',
        'status' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(IngredientCategory::class, 'ingredient_category_id');
    }

    public function baseUom(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'base_uom_id');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }
}

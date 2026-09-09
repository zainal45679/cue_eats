<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'menu_category_id',
        'sub_category_id',
        'item_code',
        'name',
        'description',
        'price',
        'image',
        'is_active',
        'is_available',
        'food_type',
        'spice_level',
        'is_chef_special',
        'is_best_seller',
        'is_jain',
        'is_tax_inclusive',
        'tax_rate',
        'kitchen_station_id',
        'channel_prices',
        'has_variants',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_available' => 'boolean',
        'is_chef_special' => 'boolean',
        'is_best_seller' => 'boolean',
        'is_jain' => 'boolean',
        'is_tax_inclusive' => 'boolean',
        'has_variants' => 'boolean',
        'price' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'spice_level' => 'integer',
        'channel_prices' => 'array',
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        return $this->image ? '/storage/' . $this->image : null;
    }

    public function category()
    {
        return $this->belongsTo(MenuCategory::class, 'menu_category_id');
    }

    public function subCategory()
    {
        return $this->belongsTo(MenuCategory::class, 'sub_category_id');
    }

    public function kitchenStation()
    {
        return $this->belongsTo(KitchenStation::class, 'kitchen_station_id');
    }

    public function variants()
    {
        return $this->hasMany(MenuItemVariant::class, 'menu_item_id')->orderBy('sort_order', 'asc');
    }

    public function outletOverrides()
    {
        return $this->hasMany(OutletMenuItemOverride::class, 'menu_item_id');
    }

    public function modifierGroups()
    {
        return $this->belongsToMany(ModifierGroup::class, 'menu_item_modifier_group')
                    ->using(MenuItemModifierGroup::class)
                    ->withTimestamps();
    }

    public function recipeItems()
    {
        return $this->hasMany(RecipeItem::class);
    }
}

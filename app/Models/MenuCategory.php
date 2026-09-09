<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class MenuCategory extends Model
{
    use HasUuids;

    protected $fillable = [
        'parent_id',
        'name',
        'description',
        'image',
        'is_active',
        'sort_order',
        'available_order_types',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'available_order_types' => 'array',
    ];

    public function parent()
    {
        return $this->belongsTo(MenuCategory::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(MenuCategory::class, 'parent_id')->orderBy('sort_order', 'asc');
    }

    public function items()
    {
        return $this->hasMany(MenuItem::class, 'menu_category_id');
    }

    public function subCategoryItems()
    {
        return $this->hasMany(MenuItem::class, 'sub_category_id');
    }
}

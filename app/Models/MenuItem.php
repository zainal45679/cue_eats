<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    protected $fillable = ['menu_category_id', 'name', 'description', 'price', 'image', 'is_active', 'is_available'];
    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        return $this->image ? '/storage/' . $this->image : null;
    }

    public function category() { return $this->belongsTo(MenuCategory::class, 'menu_category_id'); }
    public function modifierGroups() { return $this->belongsToMany(ModifierGroup::class, 'menu_item_modifier_group'); }

}

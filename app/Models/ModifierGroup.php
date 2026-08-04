<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModifierGroup extends Model
{
        protected $fillable = ['name', 'is_required', 'min_selections', 'max_selections'];

    public function modifiers() { return $this->hasMany(Modifier::class); }
    public function menuItems() { return $this->belongsToMany(MenuItem::class, 'menu_item_modifier_group'); }

}

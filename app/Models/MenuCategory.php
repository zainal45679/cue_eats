<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;



class MenuCategory extends Model
{
    use HasUuids;
        protected $fillable = ['name', 'description', 'image', 'is_active', 'sort_order'];

    public function items() { return $this->hasMany(MenuItem::class); }

}

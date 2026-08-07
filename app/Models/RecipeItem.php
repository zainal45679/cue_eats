<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;



class RecipeItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'menu_item_id',
        'modifier_id',
        'ingredient_id',
        'quantity',
        'uom_id',
    ];

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }

    public function modifier()
    {
        return $this->belongsTo(Modifier::class);
    }

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function unitOfMeasure()
    {
        return $this->belongsTo(UnitOfMeasure::class, 'uom_id');
    }
}

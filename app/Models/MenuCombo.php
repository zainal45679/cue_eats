<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class MenuCombo extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'description',
        'price',
        'image',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price' => 'decimal:2',
    ];

    public function items()
    {
        return $this->hasMany(MenuComboItem::class, 'menu_combo_id');
    }
}

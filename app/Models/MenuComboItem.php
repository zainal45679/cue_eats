<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class MenuComboItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'menu_combo_id',
        'menu_item_id',
        'quantity',
    ];

    public function combo()
    {
        return $this->belongsTo(MenuCombo::class, 'menu_combo_id');
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class OutletMenuItemOverride extends Model
{
    use HasUuids;

    protected $table = 'outlet_menu_item_overrides';

    protected $fillable = [
        'business_location_id',
        'menu_item_id',
        'price',
        'is_available',
        'is_active',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
    ];

    public function businessLocation()
    {
        return $this->belongsTo(BusinessLocation::class, 'business_location_id');
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id');
    }
}

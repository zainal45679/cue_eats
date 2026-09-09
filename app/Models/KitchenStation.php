<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class KitchenStation extends Model
{
    use HasUuids;

    protected $fillable = [
        'business_location_id',
        'name',
        'code',
        'printer_ip',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function location()
    {
        return $this->belongsTo(BusinessLocation::class, 'business_location_id');
    }

    public function menuItems()
    {
        return $this->hasMany(MenuItem::class, 'kitchen_station_id');
    }
}

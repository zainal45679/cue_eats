<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiningTable extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'business_location_id',
        'dining_zone_id',
        'name',
        'seating_capacity',
        'status',
        'parent_table_id',
    ];

    public function location()
    {
        return $this->belongsTo(BusinessLocation::class, 'business_location_id');
    }

    public function zone()
    {
        return $this->belongsTo(DiningZone::class, 'dining_zone_id');
    }

    public function parent()
    {
        return $this->belongsTo(DiningTable::class, 'parent_table_id');
    }

    public function children()
    {
        return $this->hasMany(DiningTable::class, 'parent_table_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'dining_table_id');
    }

    public function activeOrder()
    {
        return $this->hasOne(Order::class, 'dining_table_id')
            ->whereIn('status', ['draft', 'running', 'billed'])
            ->latest();
    }
}

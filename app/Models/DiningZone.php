<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiningZone extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'business_location_id',
        'name',
        'description',
    ];

    public function businessLocation()
    {
        return $this->belongsTo(BusinessLocation::class);
    }

    public function tables()
    {
        return $this->hasMany(DiningTable::class);
    }
}

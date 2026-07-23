<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternalRequestItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'internal_request_id',
        'ingredient_id',
        'quantity',
        'uom_id',
    ];

    public function internalRequest()
    {
        return $this->belongsTo(InternalRequest::class);
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

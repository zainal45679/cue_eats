<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;



class InternalRequestItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'internal_request_id',
        'ingredient_id',
        'quantity',
        'dispatched_quantity',
        'rejected_quantity',
        'uom_id',
    ];

    protected $appends = ['remaining_quantity', 'fulfillment_status'];

    public function getRemainingQuantityAttribute()
    {
        return max(0, $this->quantity - $this->dispatched_quantity - $this->rejected_quantity);
    }

    public function getFulfillmentStatusAttribute()
    {
        if ($this->dispatched_quantity == 0 && $this->rejected_quantity == 0) {
            return 'Pending';
        }
        
        $remaining = $this->remaining_quantity;

        if ($remaining > 0) {
            return 'Pending Fulfillment';
        }

        if ($this->dispatched_quantity == 0 && $this->rejected_quantity > 0) {
            return 'Rejected';
        }

        if ($this->rejected_quantity > 0) {
            return 'Partially Sent';
        }

        return 'Fulfilled';
    }

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

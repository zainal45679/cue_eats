<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;



class InventoryLedger extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'business_location_id',
        'ingredient_id',
        'transaction_type',
        'reference_type',
        'reference_id',
        'quantity',
        'running_balance',
        'created_by',
    ];

    public function location(): BelongsTo
    {
        return $this->belongsTo(BusinessLocation::class, 'business_location_id');
    }

    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by')->withoutGlobalScope(\App\Models\Scopes\TenantScope::class)->withTrashed();
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasUuid;



class InternalRequest extends Model
{
    use HasUuids;
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'request_number',
        'from_location_id',
        'to_location_id',
        'requested_by_id',
        'status',
        'remarks',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'from_location_id' => 'integer',
        'to_location_id' => 'integer',
        'requested_by_id' => 'integer',
    ];

    // Removed TenantScope because Internal Requests have from_location_id and to_location_id

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function items()
    {
        return $this->hasMany(InternalRequestItem::class);
    }

    public function fromLocation()
    {
        return $this->belongsTo(BusinessLocation::class, 'from_location_id');
    }

    public function toLocation()
    {
        return $this->belongsTo(BusinessLocation::class, 'to_location_id');
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by_id')->withoutGlobalScope(TenantScope::class)->withTrashed();
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by')->withoutGlobalScope(TenantScope::class)->withTrashed();
    }

    public function stos()
    {
        return $this->hasMany(StockTransferOrder::class, 'internal_request_id');
    }
}

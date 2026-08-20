<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasUuid;



class PurchaseOrder extends Model
{
    use HasUuids;
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'po_number',
        'business_location_id',
        'supplier_id',
        'delivery_location_id',
        'expected_delivery_date',
        'status',
        'notes',
        'subtotal',
        'tax_total',
        'grand_total',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'expected_delivery_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_total' => 'decimal:2',
        'grand_total' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function approvals()
    {
        return $this->hasMany(PurchaseOrderApproval::class);
    }

    public function businessLocation()
    {
        return $this->belongsTo(BusinessLocation::class, 'business_location_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function deliveryLocation()
    {
        return $this->belongsTo(BusinessLocation::class, 'delivery_location_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by')->withoutGlobalScope(\App\Models\Scopes\TenantScope::class)->withTrashed();
    }

    public function grns()
    {
        return $this->hasMany(GoodsReceiptNote::class, 'purchase_order_id');
    }
}

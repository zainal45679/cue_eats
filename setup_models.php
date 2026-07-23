<?php

$models = [
    'InternalRequest' => <<<PHP
<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InternalRequest extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected \$fillable = [
        'request_number',
        'from_location_id',
        'to_location_id',
        'requested_by_id',
        'status',
        'remarks',
        'created_by',
        'updated_by',
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
        return \$this->hasMany(InternalRequestItem::class);
    }

    public function fromLocation()
    {
        return \$this->belongsTo(BusinessLocation::class, 'from_location_id');
    }

    public function toLocation()
    {
        return \$this->belongsTo(BusinessLocation::class, 'to_location_id');
    }

    public function requestedBy()
    {
        return \$this->belongsTo(User::class, 'requested_by_id');
    }
}
PHP,
    'InternalRequestItem' => <<<PHP
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternalRequestItem extends Model
{
    use HasFactory;

    protected \$fillable = [
        'internal_request_id',
        'ingredient_id',
        'quantity',
        'uom_id',
    ];

    public function internalRequest()
    {
        return \$this->belongsTo(InternalRequest::class);
    }

    public function ingredient()
    {
        return \$this->belongsTo(Ingredient::class);
    }

    public function unitOfMeasure()
    {
        return \$this->belongsTo(UnitOfMeasure::class, 'uom_id');
    }
}
PHP,
    'PurchaseOrder' => <<<PHP
<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected \$fillable = [
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

    protected \$casts = [
        'expected_delivery_date' => 'date',
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
        return \$this->hasMany(PurchaseOrderItem::class);
    }

    public function approvals()
    {
        return \$this->hasMany(PurchaseOrderApproval::class);
    }

    public function businessLocation()
    {
        return \$this->belongsTo(BusinessLocation::class, 'business_location_id');
    }

    public function supplier()
    {
        return \$this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function deliveryLocation()
    {
        return \$this->belongsTo(BusinessLocation::class, 'delivery_location_id');
    }
}
PHP,
    'PurchaseOrderItem' => <<<PHP
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    use HasFactory;

    protected \$fillable = [
        'purchase_order_id',
        'ingredient_id',
        'quantity',
        'purchase_uom_id',
        'unit_price',
        'tax_amount',
        'lead_time_days',
    ];

    public function purchaseOrder()
    {
        return \$this->belongsTo(PurchaseOrder::class);
    }

    public function ingredient()
    {
        return \$this->belongsTo(Ingredient::class);
    }

    public function unitOfMeasure()
    {
        return \$this->belongsTo(UnitOfMeasure::class, 'purchase_uom_id');
    }
}
PHP,
    'PurchaseOrderApproval' => <<<PHP
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderApproval extends Model
{
    use HasFactory;

    protected \$fillable = [
        'purchase_order_id',
        'approver_id',
        'status',
        'comments',
        'acted_at',
    ];

    protected \$casts = [
        'acted_at' => 'datetime',
    ];

    public function purchaseOrder()
    {
        return \$this->belongsTo(PurchaseOrder::class);
    }

    public function approver()
    {
        return \$this->belongsTo(User::class, 'approver_id');
    }
}
PHP,
];

foreach (\$models as \$className => \$content) {
    file_put_contents("app/Models/{\$className}.php", \$content);
    echo "Created App\Models\\{\$className}\n";
}

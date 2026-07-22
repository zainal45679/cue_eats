<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class StorageLocation extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'business_location_id',
        'storage_name',
        'storage_type',
        'default_receiving_location',
        'default_issue_location',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function businessLocation(): BelongsTo
    {
        return $this->belongsTo(BusinessLocation::class);
    }
}

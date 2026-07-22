<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentTerm extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'name',
        'credit_days',
        'advance_percentage',
        'status',
    ];

    protected $casts = [
        'credit_days' => 'integer',
        'advance_percentage' => 'decimal:2',
        'status' => 'boolean',
    ];
}

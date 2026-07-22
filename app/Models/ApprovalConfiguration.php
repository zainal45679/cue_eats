<?php

namespace App\Models;

use App\Traits\TrackUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ApprovalConfiguration extends Model
{
    use HasFactory, SoftDeletes, TrackUser;

    protected $fillable = [
        'org_size_tier',
        'num_approvers_required',
        'approver_sequence_rule',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
        'num_approvers_required' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }
}

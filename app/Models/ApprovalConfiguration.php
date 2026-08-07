<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use App\Traits\TrackUser;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;



class ApprovalConfiguration extends Model
{
    use HasUuids;
    use HasFactory, SoftDeletes, TrackUser, HasUuid;

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
}

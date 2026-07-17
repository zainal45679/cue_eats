<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasStatus;
use App\Traits\HasUuid;
use App\Traits\TrackUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @mixin IdeHelperPeople
 */
final class People extends Model
{
    use HasStatus, HasUuid, SoftDeletes, TrackUser;

    protected $fillable = [
        'name',
        'age',
    ];
}

<?php

declare(strict_types=1);

namespace App\Traits;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

trait TrackUser
{
    /**
     * Boot the trait and set the created_by and updated_by automatically.
     */
    public static function bootTrackUser(): void
    {
        static::creating(function ($model): void {
            // if (!Auth::check()) {
            //     abort(401);
            // }
            $model->created_by = Auth::id();
        });

        static::updating(function ($model): void {
            // if (!Auth::check()) {
            //     abort(401);
            // }
            $model->updated_by = Auth::id();
        });
    }

    public function initializeTrackUser(): void
    {
        if (! in_array('created_by', $this->fillable)) {
            $this->fillable[] = 'created_by';
        }

        if (! in_array('updated_by', $this->fillable)) {
            $this->fillable[] = 'updated_by';
        }
    }

    public function createdBy()
    {
        if ($this->created_by === 0) {
            return new User([
                'id' => 0,
                'name' => 'System',
                'email' => 'system@localhost',
            ]);
        }

        return $this->belongsTo(User::class, 'created_by')->withoutGlobalScope(\App\Models\Scopes\TenantScope::class)->withTrashed();
    }

    public function updatedBy()
    {
        if ($this->updated_by === 0) {
            return new User([
                'id' => 0,
                'name' => 'System',
                'email' => 'system@localhost',
            ]);
        }

        return $this->belongsTo(User::class, 'updated_by')->withoutGlobalScope(\App\Models\Scopes\TenantScope::class)->withTrashed();
    }
}

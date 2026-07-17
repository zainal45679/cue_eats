<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Support\Str;

trait HasUuid
{
    public static function bootHasUuid(): void
    {
        static::creating(function ($model): void {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public static function findByUuid($uuid, $abort = true)
    {
        $model = static::where('uuid', $uuid)->first();

        if ($abort && ! $model) {
            abort(404);
        }

        return $model;
    }

    public function initializeHasUuid(): void
    {
        if (! in_array('uuid', $this->fillable)) {
            $this->fillable[] = 'uuid';
        }
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    /**
     * Scope a query to only include models where uuid is eqaual.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $uuid
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWhereUuid($query, $uuid)
    {
        return $query->where('uuid', $uuid);
    }

    /**
     * Scope a query to only include models where uuid is eqaual.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $uuid
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFirstUuid($query, $uuid)
    {
        return $query->where('uuid', $uuid)->firstOrFail();
    }
}

<?php

declare(strict_types=1);

namespace App\Traits;

use App\Enums\StatusEnum;

trait HasStatus
{
    public function initializeHasStatus(): void
    {
        if (! in_array('status', $this->fillable)) {
            $this->fillable[] = 'status';
        }
    }

    /**
     * Scope a query to only include models where status is 1 (Enabled).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('status', StatusEnum::Enabled->value);
    }

    /**
     * Scope a query to include models where status matches the given value.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  int  $status
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeStatus($query, $status = StatusEnum::Disabled->value)
    {
        return $query->where('status', $status);
    }
}

<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        // Only apply scope if a user is authenticated
        if (auth()->hasUser()) {
            $user = auth()->user();
            
            // If the user has a business_location_id and is not an admin, lock them to that location
            if ($user->business_location_id !== null && !$user->hasRole('admin')) {
                // We use $model->getTable() to avoid ambiguity in joins.
                $builder->where($model->getTable() . '.business_location_id', $user->business_location_id);
            }
        }
    }
}

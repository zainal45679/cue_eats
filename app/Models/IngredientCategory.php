<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;



class IngredientCategory extends Model
{
    use HasUuids;
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'name',
        'parent_category_id',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function parentCategory(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_category_id');
    }

    public function childCategories(): HasMany
    {
        return $this->hasMany(self::class, 'parent_category_id');
    }
}

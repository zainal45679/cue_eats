<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PosKot extends Model
{
    use HasUuids;

    protected $table = 'pos_kots';
    protected $fillable = ['pos_order_id', 'round_number', 'kot_number', 'status', 'created_by'];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'pos_order_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PosKotItem::class, 'pos_kot_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

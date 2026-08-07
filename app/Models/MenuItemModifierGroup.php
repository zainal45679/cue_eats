<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class MenuItemModifierGroup extends Pivot
{
    use HasUuids;
    
    // Ensure the primary key is recognized as a UUID string
    protected $keyType = 'string';
    public $incrementing = false;
}

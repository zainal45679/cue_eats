<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    use HasUuid;
    protected $fillable = [
        'name',
        'code',
        'logo',
        'status',
    ];

    protected $hidden = [
        'id',
        'created_at',
        'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
        ];
    }

    public static function current(): self
    {
        return self::firstOrCreate(
            [],
            ['name' => 'My Organization']
        );
    }
}

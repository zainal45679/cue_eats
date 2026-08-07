<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperOrganization
 */
final class Organization extends Model
{
    use HasUuids;
    use HasUuid;

    protected $fillable = [
        'name',
        'code',
        'logo',
        'theme_color',
        'status',
    ];

    protected $hidden = [
        'id',
        'created_at',
        'updated_at',
    ];

    public static function current(): self
    {
        return self::firstOrCreate(
            [],
            ['name' => 'My Organization']
        );
    }

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
        ];
    }
}

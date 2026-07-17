<?php

declare(strict_types=1);

namespace App\Enums;

enum EntityEnum: string
{
    case Products = 'products';
    case Roles = 'roles';
    case Users = 'users';
    case Dashboard = 'dashboard';
    case System = 'system';

    public function actions(): array
    {
        return match ($this) {
            self::Dashboard => [ActionEnum::Access],
            self::System => [ActionEnum::Manage],
            default => ActionEnum::common(),
        };
    }

    public function key(ActionEnum $action): string
    {
        return "{$action->value}.{$this->value}";
    }
}

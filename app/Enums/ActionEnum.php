<?php

declare(strict_types=1);

namespace App\Enums;

enum ActionEnum: string
{
    case Create = 'create';
    case Read = 'read';
    case Update = 'update';
    case Delete = 'delete';
    case Access = 'access';
    case Manage = 'manage';

    public static function common(): array
    {
        return [
            self::Create,
            self::Read,
            self::Update,
            self::Delete,
        ];
    }
}

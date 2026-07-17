<?php

declare(strict_types=1);

namespace App\Enums;

enum PermissionEnum: string
{
    public static function all(): array
    {
        $permissions = [];

        foreach (EntityEnum::cases() as $entity) {
            foreach ($entity->actions() as $action) {
                $permissions[] = "{$action->value}.{$entity->value}";
            }
        }

        return $permissions;
    }
}

<?php

declare(strict_types=1);

namespace App\Helpers;

use App\Enums\ActionEnum;
use App\Enums\EntityEnum;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Gate;

final class GateHelper
{
    public static function read(EntityEnum $entity): Response
    {
        return self::authorize(ActionEnum::Read, $entity);
    }

    public static function create(EntityEnum $entity): Response
    {
        return self::authorize(ActionEnum::Create, $entity);
    }

    public static function update(EntityEnum $entity): Response
    {
        return self::authorize(ActionEnum::Update, $entity);
    }

    public static function delete(EntityEnum $entity): Response
    {
        return self::authorize(ActionEnum::Delete, $entity);
    }

    public static function access(EntityEnum $entity): Response
    {
        return self::authorize(ActionEnum::Access, $entity);
    }

    public static function manage(EntityEnum $entity): Response
    {
        return self::authorize(ActionEnum::Manage, $entity);
    }

    private static function authorize(ActionEnum $action, EntityEnum $entity): Response
    {
        return Gate::authorize($action->value.'.'.$entity->value);
    }
}

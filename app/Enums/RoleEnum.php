<?php

declare(strict_types=1);

namespace App\Enums;

enum RoleEnum: string
{
    case SuperAdmin = 'super-admin';
    case DeliveryAdmin = 'delivery-admin';
}

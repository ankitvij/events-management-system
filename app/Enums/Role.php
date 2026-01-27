<?php

namespace App\Enums;

enum Role: string
{
    case USER = 'user';
    case ADMIN = 'admin';
    case SUPER_ADMIN = 'super_admin';

    /**
     * Return all backed values.
     *
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn(Role $r) => $r->value, self::cases());
    }
}

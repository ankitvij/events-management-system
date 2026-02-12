<?php

namespace App\Enums;

enum VendorType: string
{
    case Food = 'food';
    case Drinks = 'drinks';
    case Light = 'light';
    case Sound = 'sound';
    case Flooring = 'flooring';
    case Other = 'other';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (VendorType $t) => $t->value, self::cases());
    }
}

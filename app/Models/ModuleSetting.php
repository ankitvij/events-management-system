<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModuleSetting extends Model
{
    protected $fillable = [
        'agencies_enabled',
        'organisers_enabled',
        'artists_enabled',
        'promoters_enabled',
        'vendors_enabled',
        'venues_enabled',
    ];

    protected function casts(): array
    {
        return [
            'agencies_enabled' => 'boolean',
            'organisers_enabled' => 'boolean',
            'artists_enabled' => 'boolean',
            'promoters_enabled' => 'boolean',
            'vendors_enabled' => 'boolean',
            'venues_enabled' => 'boolean',
        ];
    }

    public static function modules(): array
    {
        $defaults = self::defaults();
        $settings = self::query()->first();

        if (! $settings) {
            return $defaults;
        }

        foreach (array_keys($defaults) as $key) {
            $value = $settings->{$key};
            if ($value !== null) {
                $defaults[$key] = (bool) $value;
            }
        }

        return $defaults;
    }

    public static function isEnabled(string $module): bool
    {
        return (bool) (self::modules()[$module] ?? true);
    }

    public static function defaults(): array
    {
        return [
            'agencies_enabled' => (bool) config('modules.agencies_enabled', true),
            'organisers_enabled' => (bool) config('modules.organisers_enabled', true),
            'artists_enabled' => (bool) config('modules.artists_enabled', true),
            'promoters_enabled' => (bool) config('modules.promoters_enabled', true),
            'vendors_enabled' => (bool) config('modules.vendors_enabled', true),
            'venues_enabled' => (bool) config('modules.venues_enabled', true),
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentSetting extends Model
{
    protected $fillable = [
        'bank_account_name',
        'bank_iban',
        'bank_bic',
        'bank_reference_hint',
        'bank_instructions',
        'bank_enabled',
        'paypal_id',
        'paypal_instructions',
        'paypal_enabled',
        'revolut_id',
        'revolut_instructions',
        'revolut_enabled',
        'stripe_id',
        'stripe_instructions',
        'stripe_enabled',
    ];

    protected function casts(): array
    {
        return [
            'bank_enabled' => 'boolean',
            'paypal_enabled' => 'boolean',
            'revolut_enabled' => 'boolean',
            'stripe_enabled' => 'boolean',
        ];
    }

    public static function paymentMethods(): array
    {
        $methods = config('payments') ?? [];
        $settings = self::query()->first();
        if (! $settings) {
            return $methods;
        }

        $overrides = [
            'bank_transfer' => [
                'account_name' => $settings->bank_account_name,
                'iban' => $settings->bank_iban,
                'bic' => $settings->bank_bic,
                'reference_hint' => $settings->bank_reference_hint,
                'instructions' => $settings->bank_instructions,
                'enabled' => $settings->bank_enabled,
            ],
            'paypal_transfer' => [
                'account_id' => $settings->paypal_id,
                'instructions' => $settings->paypal_instructions,
                'enabled' => $settings->paypal_enabled,
            ],
            'revolut_transfer' => [
                'account_id' => $settings->revolut_id,
                'instructions' => $settings->revolut_instructions,
                'enabled' => $settings->revolut_enabled,
            ],
            'stripe_transfer' => [
                'account_id' => $settings->stripe_id,
                'instructions' => $settings->stripe_instructions,
                'enabled' => $settings->stripe_enabled,
            ],
        ];

        foreach ($overrides as $method => $values) {
            foreach ($values as $key => $value) {
                if ($value === null) {
                    continue;
                }
                if (! isset($methods[$method]) || ! is_array($methods[$method])) {
                    $methods[$method] = [];
                }
                $methods[$method][$key] = $value;
            }
        }

        foreach ($methods as $method => $values) {
            if (! is_array($values)) {
                continue;
            }

            foreach (['display_name', 'instructions', 'reference_hint'] as $field) {
                if (array_key_exists($field, $values)) {
                    $methods[$method][$field] = self::sanitizePaymentCopy($values[$field] ?? null);
                }
            }
        }

        return $methods;
    }

    public static function paymentMethod(string $method): ?array
    {
        $methods = self::paymentMethods();

        return $methods[$method] ?? null;
    }

    protected static function sanitizePaymentCopy(mixed $value): ?string
    {
        if (! is_string($value)) {
            return $value;
        }

        $clean = preg_replace([
            '/\s*pay(?:ment)?\s+(?:in|within)\s+7\s+days\.?\s*/i',
            '/\s*payment\s+needs\s+to\s+be\s+there\s+at\s+least\s+1\s+day\s+before\s+the\s+event\.?\s*/i',
        ], ' ', $value);

        $clean = preg_replace('/\s{2,}/', ' ', (string) $clean);

        return trim($clean);
    }
}

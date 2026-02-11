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
        'paypal_id',
        'paypal_instructions',
        'revolut_id',
        'revolut_instructions',
    ];

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
            ],
            'paypal_transfer' => [
                'account_id' => $settings->paypal_id,
                'instructions' => $settings->paypal_instructions,
            ],
            'revolut_transfer' => [
                'account_id' => $settings->revolut_id,
                'instructions' => $settings->revolut_instructions,
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

        return $methods;
    }

    public static function paymentMethod(string $method): ?array
    {
        $methods = self::paymentMethods();

        return $methods[$method] ?? null;
    }
}

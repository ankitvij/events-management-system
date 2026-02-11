<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaymentSettingsRequest;
use App\Models\PaymentSetting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrderPaymentMethodsController extends Controller
{
    public function edit(): Response
    {
        $settings = PaymentSetting::query()->first();
        $defaults = config('payments') ?? [];

        $values = [
            'bank_account_name' => $settings?->bank_account_name ?? ($defaults['bank_transfer']['account_name'] ?? null),
            'bank_iban' => $settings?->bank_iban ?? ($defaults['bank_transfer']['iban'] ?? null),
            'bank_bic' => $settings?->bank_bic ?? ($defaults['bank_transfer']['bic'] ?? null),
            'bank_reference_hint' => $settings?->bank_reference_hint ?? ($defaults['bank_transfer']['reference_hint'] ?? null),
            'bank_instructions' => $settings?->bank_instructions ?? ($defaults['bank_transfer']['instructions'] ?? null),
            'paypal_id' => $settings?->paypal_id ?? ($defaults['paypal_transfer']['account_id'] ?? null),
            'paypal_instructions' => $settings?->paypal_instructions ?? ($defaults['paypal_transfer']['instructions'] ?? null),
            'revolut_id' => $settings?->revolut_id ?? ($defaults['revolut_transfer']['account_id'] ?? null),
            'revolut_instructions' => $settings?->revolut_instructions ?? ($defaults['revolut_transfer']['instructions'] ?? null),
        ];

        return Inertia::render('Orders/PaymentMethods', [
            'payment_settings' => $values,
        ]);
    }

    public function update(PaymentSettingsRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data = collect($data)->map(function ($value) {
            return $value === '' ? null : $value;
        })->all();

        $settings = PaymentSetting::query()->firstOrCreate();
        $settings->fill($data);
        $settings->save();

        return redirect()->route('orders.payment-methods.edit')->with('success', 'Payment settings updated.');
    }
}

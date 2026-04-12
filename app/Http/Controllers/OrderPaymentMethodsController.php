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
        $bank = PaymentSetting::paymentMethod('bank_transfer') ?? config('payments.bank_transfer', []);
        $paypal = PaymentSetting::paymentMethod('paypal_transfer') ?? config('payments.paypal_transfer', []);
        $revolut = PaymentSetting::paymentMethod('revolut_transfer') ?? config('payments.revolut_transfer', []);
        $stripe = PaymentSetting::paymentMethod('stripe_transfer') ?? config('payments.stripe_transfer', []);

        $values = [
            'bank_account_name' => $bank['account_name'] ?? null,
            'bank_iban' => $bank['iban'] ?? null,
            'bank_bic' => $bank['bic'] ?? null,
            'bank_reference_hint' => $bank['reference_hint'] ?? null,
            'bank_instructions' => $bank['instructions'] ?? null,
            'paypal_id' => $paypal['account_id'] ?? null,
            'paypal_instructions' => $paypal['instructions'] ?? null,
            'revolut_id' => $revolut['account_id'] ?? null,
            'revolut_instructions' => $revolut['instructions'] ?? null,
            'stripe_id' => $stripe['account_id'] ?? null,
            'stripe_instructions' => $stripe['instructions'] ?? null,
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

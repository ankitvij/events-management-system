<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaymentSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_super_admin;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'bank_account_name' => ['nullable', 'string', 'max:255'],
            'bank_iban' => ['nullable', 'string', 'max:64'],
            'bank_bic' => ['nullable', 'string', 'max:64'],
            'bank_reference_hint' => ['nullable', 'string', 'max:255'],
            'bank_instructions' => ['nullable', 'string', 'max:1000'],
            'bank_enabled' => ['required', 'boolean'],
            'bank_flat_fee' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'paypal_id' => ['nullable', 'string', 'max:255'],
            'paypal_instructions' => ['nullable', 'string', 'max:1000'],
            'paypal_enabled' => ['required', 'boolean'],
            'paypal_flat_fee' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'revolut_id' => ['nullable', 'string', 'max:255'],
            'revolut_instructions' => ['nullable', 'string', 'max:1000'],
            'revolut_enabled' => ['required', 'boolean'],
            'revolut_flat_fee' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'stripe_enabled' => ['required', 'boolean'],
            'stripe_flat_fee' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrganiserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'active' => ['nullable', 'boolean'],
            'bank_account_name' => ['nullable', 'string', 'max:255'],
            'bank_iban' => ['nullable', 'string', 'max:64'],
            'bank_bic' => ['nullable', 'string', 'max:64'],
            'bank_reference_hint' => ['nullable', 'string', 'max:255'],
            'paypal_id' => ['nullable', 'string', 'max:255'],
            'revolut_id' => ['nullable', 'string', 'max:255'],
        ];
    }
}

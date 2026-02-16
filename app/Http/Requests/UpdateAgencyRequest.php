<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAgencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return (bool) $user?->hasRole(['admin', 'super_admin']);
    }

    public function rules(): array
    {
        $agencyId = $this->route('agency')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('agencies', 'email')->ignore($agencyId)],
            'active' => ['nullable', 'boolean'],
        ];
    }
}

<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class ModuleSettingsUpdateRequest extends FormRequest
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
            'agencies_enabled' => ['required', 'boolean'],
            'organisers_enabled' => ['required', 'boolean'],
            'artists_enabled' => ['required', 'boolean'],
            'promoters_enabled' => ['required', 'boolean'],
            'vendors_enabled' => ['required', 'boolean'],
            'venues_enabled' => ['required', 'boolean'],
        ];
    }
}

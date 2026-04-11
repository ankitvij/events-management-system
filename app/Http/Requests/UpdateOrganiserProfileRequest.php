<?php

namespace App\Http\Requests;

use App\Models\Organiser;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrganiserProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $organiserId = $this->session()->get('organiser_id');
        if ($organiserId) {
            $organiserId = Organiser::query()->whereKey($organiserId)->value('id');
        }

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('organisers', 'email')->ignore($organiserId)],
        ];
    }
}

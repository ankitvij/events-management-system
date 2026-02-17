<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventFromLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:5120'],
            'start_at' => ['required', 'date'],
            'end_at' => ['nullable', 'date', 'after_or_equal:start_at'],
            'city' => ['required', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'facebook_url' => ['nullable', 'url', 'max:255'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'whatsapp_url' => ['nullable', 'string', 'max:255'],
            'active' => ['nullable', 'boolean'],
            'organiser_id' => ['nullable', 'integer', 'exists:organisers,id'],
            'organiser_ids' => ['nullable', 'array'],
            'organiser_ids.*' => ['integer', 'exists:organisers,id'],
            'promoter_ids' => ['nullable', 'array'],
            'promoter_ids.*' => ['integer', 'exists:users,id'],
            'vendor_ids' => ['nullable', 'array'],
            'vendor_ids.*' => ['integer', 'exists:vendors,id'],
            'artist_ids' => ['nullable', 'array'],
            'artist_ids.*' => ['integer', 'exists:artists,id'],
            'edit_password' => ['nullable', 'string', 'min:6', 'max:64'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('edit_password') && $this->input('edit_password') === '') {
            $this->merge(['edit_password' => null]);
        }
    }

    public function messages(): array
    {
        return [
            'image.image' => 'Please upload a valid image (jpg, png, webp, etc.).',
            'image.max' => 'Image must be 5MB or smaller.',
            'image.uploaded' => 'The image failed to upload. Try a smaller file (max 5MB).',
            'edit_password.min' => 'Password must be at least 6 characters.',
        ];
    }
}

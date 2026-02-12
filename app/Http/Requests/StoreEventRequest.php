<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isGuest = ! $this->user();

        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['required', 'image', 'max:5120'],
            'start_at' => ['required', 'date'],
            'end_at' => ['nullable', 'date', 'after_or_equal:start_at'],
            'city' => ['required', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'facebook_url' => ['nullable', 'url', 'max:255'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'whatsapp_url' => ['nullable', 'string', 'max:255'],
            'active' => ['nullable', 'boolean'],
            'organiser_id' => [
                $this->user() ? 'required' : 'nullable',
                'integer',
                'exists:organisers,id',
            ],
            'organiser_ids' => ['nullable', 'array'],
            'organiser_ids.*' => ['integer', 'exists:organisers,id'],
            'promoter_ids' => ['nullable', 'array'],
            'promoter_ids.*' => ['integer', 'exists:users,id'],
            'vendor_ids' => ['nullable', 'array'],
            'vendor_ids.*' => ['integer', 'exists:vendors,id'],
            'organiser_emails' => ['nullable', 'string'],
            // Allow guests to supply a single organiser name/email when creating an event
            'organiser_name' => [$isGuest ? 'required' : 'nullable', 'string', 'max:255'],
            'organiser_email' => [$isGuest ? 'required' : 'nullable', 'email', 'max:255'],
            'edit_password' => ['nullable', 'string', 'min:6', 'max:64'],

            'tickets' => ['required', 'array', 'min:1'],
            'tickets.*.name' => ['required', 'string', 'max:255'],
            'tickets.*.price' => ['nullable', 'numeric', 'min:0'],
            'tickets.*.quantity_total' => ['required', 'integer', 'min:1'],
            'tickets.*.active' => ['nullable', 'boolean'],
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
            'tickets.required' => 'Please add at least one ticket type.',
            'tickets.min' => 'Please add at least one ticket type.',
        ];
    }
}

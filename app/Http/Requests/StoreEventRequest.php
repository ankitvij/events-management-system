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
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:2048'],
            'start_at' => ['required', 'date'],
            'end_at' => ['nullable', 'date', 'after_or_equal:start_at'],
            'location' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'active' => ['nullable', 'boolean'],
            'organiser_ids' => ['nullable', 'array'],
            'organiser_ids.*' => ['integer', 'exists:organisers,id'],
            'organiser_emails' => ['nullable', 'string'],
            // Allow guests to supply a single organiser name/email when creating an event
            'organiser_name' => ['nullable', 'string', 'max:255'],
            'organiser_email' => ['nullable', 'email', 'max:255'],
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        $current = $this->user();
        $event = $this->route('event');

        if (! $current) {
            return false;
        }

        if ($current->is_super_admin) {
            return true;
        }

        if ($event && $event->user_id === $current->id) {
            return true;
        }

        if ($event && $current->hasRole(Role::AGENCY->value) && ! $current->hasRole([Role::ADMIN->value, Role::SUPER_ADMIN->value])) {
            return (int) ($event->agency_id ?? 0) === (int) ($current->agency_id ?? 0);
        }

        return false;
    }

    public function rules(): array
    {
        $agencyId = $this->user()?->agency_id;
        $isAgencyManager = $this->user()?->hasRole(Role::AGENCY->value) && ! $this->user()?->hasRole([Role::ADMIN->value, Role::SUPER_ADMIN->value]);

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
            'organiser_id' => [
                'required',
                'integer',
                Rule::exists('organisers', 'id')->when($isAgencyManager, function ($rule) use ($agencyId) {
                    $rule->where(fn ($query) => $query->where('agency_id', $agencyId));
                }),
            ],
            'organiser_ids' => ['nullable', 'array'],
            'organiser_ids.*' => [
                'integer',
                Rule::exists('organisers', 'id')->when($isAgencyManager, function ($rule) use ($agencyId) {
                    $rule->where(fn ($query) => $query->where('agency_id', $agencyId));
                }),
            ],
            'promoter_ids' => ['nullable', 'array'],
            'promoter_ids.*' => [
                'integer',
                Rule::exists('users', 'id')->when($isAgencyManager, function ($rule) use ($agencyId) {
                    $rule->where(fn ($query) => $query->where('agency_id', $agencyId)->where('role', Role::USER->value));
                }),
            ],
            'vendor_ids' => ['nullable', 'array'],
            'vendor_ids.*' => [
                'integer',
                Rule::exists('vendors', 'id')->when($isAgencyManager, function ($rule) use ($agencyId) {
                    $rule->where(fn ($query) => $query->where('agency_id', $agencyId));
                }),
            ],
            'artist_ids' => ['nullable', 'array'],
            'artist_ids.*' => [
                'integer',
                Rule::exists('artists', 'id')->when($isAgencyManager, function ($rule) use ($agencyId) {
                    $rule->where(fn ($query) => $query->where('agency_id', $agencyId));
                }),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'image.image' => 'Please upload a valid image (jpg, png, webp, etc.).',
            'image.max' => 'Image must be 5MB or smaller.',
            'image.uploaded' => 'The image failed to upload. Try a smaller file (max 5MB).',
        ];
    }
}

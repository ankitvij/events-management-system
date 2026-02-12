<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateArtistRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $artist = $this->route('artist');
        $artistId = is_object($artist) ? ($artist->id ?? null) : null;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('artists', 'email')->ignore($artistId)],
            'city' => ['required', 'string', 'max:100'],
            'experience_years' => ['required', 'integer', 'min:0', 'max:80'],
            'skills' => ['required', 'string', 'max:2000'],
            'description' => ['nullable', 'string', 'max:5000'],
            'equipment' => ['nullable', 'string', 'max:5000'],
            'photo' => ['nullable', 'image', 'max:5120'],
            'active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'photo.image' => 'Please upload a valid image (jpg, png, webp, etc.).',
            'photo.max' => 'Image must be 5MB or smaller.',
            'photo.uploaded' => 'The image failed to upload. Try a smaller file (max 5MB).',
        ];
    }
}

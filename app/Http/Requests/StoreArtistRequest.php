<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreArtistRequest extends FormRequest
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
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:artists,email'],
            'city' => ['required', 'string', 'max:100'],
            'experience_years' => ['required', 'integer', 'min:0', 'max:80'],
            'skills' => ['required', 'string', 'max:2000'],
            'artist_types' => ['nullable', 'array'],
            'artist_types.*' => ['string', Rule::in(['dj', 'teacher', 'performer', 'public_speaker', 'other'])],
            'description' => ['nullable', 'string', 'max:5000'],
            'equipment' => ['nullable', 'string', 'max:5000'],
            'photo' => ['required', 'image', 'max:5120'],
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

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user ? $user->hasRole(['user', 'admin']) : false;
    }

    public function rules(): array
    {
        $pageId = $this->route('page') ? $this->route('page')->id : null;

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:pages,slug,'.($pageId ?? 'NULL').',id'],
            'content' => ['nullable', 'string'],
            'active' => ['nullable', 'boolean'],
        ];
    }
}

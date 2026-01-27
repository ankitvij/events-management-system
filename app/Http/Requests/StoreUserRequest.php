<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $current = $this->user();

        $role = $this->input('role');
        if ($role && in_array($role, [Role::ADMIN->value, Role::SUPER_ADMIN->value], true) && (! $current || ! $current->is_super_admin)) {
            return false;
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['nullable', Rule::in(Role::values())],
            'active' => ['nullable', 'boolean'],
        ];
    }
}

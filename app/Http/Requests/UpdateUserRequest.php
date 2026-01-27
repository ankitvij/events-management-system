<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $current = $this->user();
        $target = $this->route('user');

        // Prevent non-super-admins from modifying a super admin
        if ($target && $target->is_super_admin && (! $current || ! $current->is_super_admin)) {
            return false;
        }

        $role = $this->input('role');
        if ($role && in_array($role, [Role::ADMIN->value, Role::SUPER_ADMIN->value], true) && (! $current || ! $current->is_super_admin)) {
            return false;
        }

        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['nullable', Rule::in(Role::values())],
            'active' => ['nullable', 'boolean'],
        ];
    }
}

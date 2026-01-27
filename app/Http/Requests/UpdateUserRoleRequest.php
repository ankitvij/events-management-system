<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Validation\Rule;

class UpdateUserRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $current = $this->user();
        if (! $current || ! $current->is_super_admin) {
            return false;
        }

        $target = $this->route('user');
        // Prevent demoting the last super admin
        $newRole = $this->input('role');
        if ($target && $target->is_super_admin && $newRole !== Role::SUPER_ADMIN->value) {
            $count = User::where('is_super_admin', true)->count();
            if ($count <= 1) {
                return false;
            }
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'role' => ['required', 'string', Rule::in(Role::values())],
        ];
    }
}

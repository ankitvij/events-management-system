<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Customer;

class CustomerPolicy
{
    public function viewAny(?User $user): bool
    {
        return $user !== null;
    }

    public function view(?User $user, Customer $customer): bool
    {
        return $user !== null;
    }

    public function create(User $user): bool
    {
        return $user->is_super_admin || $user->role === 'admin';
    }

    public function update(User $user, Customer $customer): bool
    {
        return $user->is_super_admin || $user->role === 'admin';
    }

    public function delete(User $user, Customer $customer): bool
    {
        return $user->is_super_admin || $user->role === 'admin';
    }
}

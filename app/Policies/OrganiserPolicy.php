<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Organiser;

class OrganiserPolicy
{
    public function viewAny(?User $user): bool
    {
        return $user !== null;
    }

    public function view(?User $user, Organiser $organiser): bool
    {
        return $user !== null;
    }

    public function create(User $user): bool
    {
        return $user->is_super_admin || $user->role === 'admin';
    }

    public function update(User $user, Organiser $organiser): bool
    {
        return $user->is_super_admin || $user->role === 'admin';
    }

    public function delete(User $user, Organiser $organiser): bool
    {
        return $user->is_super_admin || $user->role === 'admin';
    }
}

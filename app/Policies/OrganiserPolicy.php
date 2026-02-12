<?php

namespace App\Policies;

use App\Models\Organiser;
use App\Models\User;

class OrganiserPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Organiser $organiser): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function update(User $user, Organiser $organiser): bool
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, Organiser $organiser): bool
    {
        return $user->hasRole('admin');
    }
}

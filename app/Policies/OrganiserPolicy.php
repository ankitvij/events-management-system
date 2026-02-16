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
        return $user->hasRole(['admin', 'super_admin', 'agency']);
    }

    public function update(User $user, Organiser $organiser): bool
    {
        if ($user->hasRole(['admin', 'super_admin'])) {
            return true;
        }

        return $user->hasRole('agency') && (int) ($organiser->agency_id ?? 0) === (int) ($user->agency_id ?? 0);
    }

    public function delete(User $user, Organiser $organiser): bool
    {
        if ($user->hasRole(['admin', 'super_admin'])) {
            return true;
        }

        return $user->hasRole('agency') && (int) ($organiser->agency_id ?? 0) === (int) ($user->agency_id ?? 0);
    }
}

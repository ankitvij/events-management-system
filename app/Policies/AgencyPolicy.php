<?php

namespace App\Policies;

use App\Models\Agency;
use App\Models\User;

class AgencyPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Agency $agency): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'super_admin']);
    }

    public function update(User $user, Agency $agency): bool
    {
        return $user->hasRole(['admin', 'super_admin']);
    }

    public function delete(User $user, Agency $agency): bool
    {
        return $user->hasRole(['admin', 'super_admin']);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Agency $agency): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Agency $agency): bool
    {
        return false;
    }
}

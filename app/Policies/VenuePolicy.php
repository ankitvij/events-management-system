<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Venue;

class VenuePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, Venue $venue): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'super_admin', 'agency']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Venue $venue): bool
    {
        if ($user->hasRole(['admin', 'super_admin'])) {
            return true;
        }

        return $user->hasRole('agency') && (int) ($venue->agency_id ?? 0) === (int) ($user->agency_id ?? 0);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Venue $venue): bool
    {
        if ($user->hasRole(['admin', 'super_admin'])) {
            return true;
        }

        return $user->hasRole('agency') && (int) ($venue->agency_id ?? 0) === (int) ($user->agency_id ?? 0);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Venue $venue): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Venue $venue): bool
    {
        return false;
    }
}

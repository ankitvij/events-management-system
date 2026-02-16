<?php

namespace App\Policies;

use App\Models\Artist;
use App\Models\User;

class ArtistPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Artist $artist): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'super_admin', 'agency']);
    }

    public function update(User $user, Artist $artist): bool
    {
        if ($user->hasRole(['admin', 'super_admin'])) {
            return true;
        }

        return $user->hasRole('agency') && (int) ($artist->agency_id ?? 0) === (int) ($user->agency_id ?? 0);
    }

    public function delete(User $user, Artist $artist): bool
    {
        if ($user->hasRole(['admin', 'super_admin'])) {
            return true;
        }

        return $user->hasRole('agency') && (int) ($artist->agency_id ?? 0) === (int) ($user->agency_id ?? 0);
    }
}

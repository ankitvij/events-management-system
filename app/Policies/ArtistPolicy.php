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
        return $user->hasRole('admin');
    }

    public function update(User $user, Artist $artist): bool
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, Artist $artist): bool
    {
        return $user->hasRole('admin');
    }
}

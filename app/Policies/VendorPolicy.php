<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vendor;

class VendorPolicy
{
    public function viewAny(?User $user): bool
    {
        return $user !== null && $user->hasRole('admin');
    }

    public function view(User $user, Vendor $vendor): bool
    {
        return $user->hasRole('admin');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function update(User $user, Vendor $vendor): bool
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, Vendor $vendor): bool
    {
        return $user->hasRole('admin');
    }
}

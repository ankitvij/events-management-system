<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vendor;

class VendorPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Vendor $vendor): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'super_admin', 'agency']);
    }

    public function update(User $user, Vendor $vendor): bool
    {
        if ($user->hasRole(['admin', 'super_admin'])) {
            return true;
        }

        return $user->hasRole('agency') && (int) ($vendor->agency_id ?? 0) === (int) ($user->agency_id ?? 0);
    }

    public function delete(User $user, Vendor $vendor): bool
    {
        if ($user->hasRole(['admin', 'super_admin'])) {
            return true;
        }

        return $user->hasRole('agency') && (int) ($vendor->agency_id ?? 0) === (int) ($user->agency_id ?? 0);
    }
}

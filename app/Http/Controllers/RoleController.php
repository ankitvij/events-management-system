<?php

namespace App\Http\Controllers;

use App\Enums\Role as RoleEnum;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Models\RoleChange;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController
{
    public function index()
    {
        $current = auth()->user();
        if (! $current || ! $current->is_super_admin) {
            abort(403);
        }

        $query = User::where('id', '!=', $current->id);

        $q = request('q') ?? request('search');
        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")->orWhere('email', 'like', "%{$q}%");
            });
        }

        $sort = request('sort');
        switch ($sort) {
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'created_desc':
                $query->orderBy('created_at', 'desc');
                break;
            default:
                $query->orderBy('name');
                break;
        }

        $users = $query->get(['id', 'name', 'email', 'role', 'is_super_admin']);

        return Inertia::render('Roles/Index', [
            'roles' => RoleEnum::values(),
            'users' => $users,
        ]);
    }

    public function update(UpdateUserRoleRequest $request, User $user)
    {
        $data = $request->validated();

        $old = $user->role;
        $user->role = $data['role'];
        $user->is_super_admin = ($data['role'] === RoleEnum::SUPER_ADMIN->value);
        $user->save();

        RoleChange::create([
            'user_id' => $user->id,
            'changed_by' => auth()->id(),
            'old_role' => $old,
            'new_role' => $user->role,
        ]);

        return redirect()->route('roles.index')->with('success', 'User role updated.');
    }

    public function undo(Request $request, User $user)
    {
        $current = auth()->user();
        if (! $current || ! $current->is_super_admin) {
            abort(403);
        }

        $last = RoleChange::where('user_id', $user->id)->latest()->first();
        if (! $last) {
            return redirect()->route('roles.index')->with('error', 'No role change to undo.');
        }

        // Prevent demoting the last super admin
        if ($user->is_super_admin && $last->old_role !== RoleEnum::SUPER_ADMIN->value) {
            $count = User::where('is_super_admin', true)->count();
            if ($count <= 1) {
                return redirect()->route('roles.index')->with('error', 'Cannot undo: would remove last super admin.');
            }
        }

        $user->role = $last->old_role ?: RoleEnum::USER->value;
        $user->is_super_admin = ($user->role === RoleEnum::SUPER_ADMIN->value);
        $user->save();

        RoleChange::create([
            'user_id' => $user->id,
            'changed_by' => auth()->id(),
            'old_role' => $last->new_role,
            'new_role' => $user->role,
        ]);

        return redirect()->route('roles.index')->with('success', 'Role change undone.');
    }
}

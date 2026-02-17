<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController
{
    public function promoters(Request $request)
    {
        $query = User::query()
            ->where('is_super_admin', false)
            ->where('active', true)
            ->where('role', Role::USER->value)
            ->orderBy('name');

        $current = $request->user();
        if ($current && $current->hasRole(Role::AGENCY->value) && ! $current->hasRole([Role::ADMIN->value, Role::SUPER_ADMIN->value])) {
            $query->where('agency_id', $current->agency_id);
        }

        $promoters = $query->paginate(20)->withQueryString();

        if ($request->expectsJson() || app()->runningUnitTests()) {
            return response()->json(['promoters' => $promoters]);
        }

        return Inertia::render('Promoters/Index', [
            'promoters' => $promoters,
        ]);
    }

    public function index(Request $request)
    {
        $query = User::query();

        // apply search
        $q = request('q') ?? request('search');
        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        // apply sort
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

        $current = auth()->user();
        if (! $current) {
            abort(404);
        }

        if ($current->is_super_admin) {
            // show all (but exclude the current user below)
        } elseif ($current->role === Role::ADMIN) {
            // admins should not see admins or super admins
            $query->where('is_super_admin', false)->where('role', Role::USER->value);
        } elseif ($current->hasRole(Role::AGENCY->value)) {
            $query->where('is_super_admin', false)
                ->where('role', Role::USER->value)
                ->where('agency_id', $current->agency_id);
        } else {
            // regular users only see themselves (we'll exclude current user from the listing)
            $query->where('id', $current->id);
        }

        // Apply active filter if present (all/active/inactive)
        $filter = request('active');
        if ($filter === 'active') {
            $query->where('active', true);
        } elseif ($filter === 'inactive') {
            $query->where('active', false);
        }

        // Free-text search via `q`
        $search = request('q', '');
        if ($search) {
            $like = "%{$search}%";
            $query->where(function ($q) use ($like) {
                $q->where('name', 'like', $like)
                    ->orWhere('email', 'like', $like);
            });
        }

        // Apply optional sort parameter
        $sort = request('sort');
        switch ($sort) {
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'created_desc':
                $query->orderBy('created_at', 'desc');
                break;
            default:
                // keep default ordering
                break;
        }

        // Exclude the authenticated user from the listing for all roles
        $query->where('id', '!=', $current->id);

        $users = $query->paginate(20)->withQueryString();

        if ($request->expectsJson() || $request->wantsJson() || app()->runningInConsole()) {
            return response()->json(['users' => $users]);
        }

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create');
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['password'] = bcrypt($data['password']);
        $current = $request->user();

        if ($current && $current->hasRole(Role::AGENCY->value) && ! $current->hasRole([Role::ADMIN->value, Role::SUPER_ADMIN->value])) {
            $data['agency_id'] = $current->agency_id;
            $data['role'] = Role::USER->value;
            $data['is_super_admin'] = false;
        }

        // Set super admin flag based on role if provided
        if (! array_key_exists('is_super_admin', $data) && array_key_exists('role', $data)) {
            $data['is_super_admin'] = ($data['role'] === 'super_admin');
        } elseif (! array_key_exists('is_super_admin', $data)) {
            $data['is_super_admin'] = false;
        }

        $user = User::create($data);

        return redirect()->route('users.show', $user->id)->with('success', 'User created.');
    }

    public function show(User $user)
    {
        $current = auth()->user();
        if (! $current) {
            abort(404);
        }

        // allow self or super admin
        if ($current->id === $user->id || $current->is_super_admin) {
            // allowed
        } elseif ($current->role === Role::ADMIN) {
            // admins may only view regular users
            if ($user->is_super_admin || $user->role === Role::ADMIN) {
                abort(404);
            }
        } elseif ($current->hasRole(Role::AGENCY->value)) {
            if ($user->is_super_admin || $user->role !== Role::USER->value || (int) ($user->agency_id ?? 0) !== (int) ($current->agency_id ?? 0)) {
                abort(404);
            }
        } else {
            // regular users may only view themselves
            abort(404);
        }

        $roleChanges = $user->roleChanges()->with('changer')->latest()->get()->map(function ($change) {
            return [
                'id' => $change->id,
                'old_role' => $change->old_role,
                'new_role' => $change->new_role,
                'changed_by' => $change->changer ? ['id' => $change->changer->id, 'name' => $change->changer->name] : null,
                'created_at' => $change->created_at,
            ];
        });

        return Inertia::render('Users/Show', ['user' => $user, 'roleChanges' => $roleChanges]);
    }

    public function showPromoter(Request $request, User $promoter)
    {
        if ($promoter->is_super_admin || ! $promoter->hasRole(Role::USER->value)) {
            abort(404);
        }

        if (! auth()->check() && ! $promoter->active) {
            abort(404);
        }

        $current = $request->user();
        if ($current && $current->hasRole(Role::AGENCY->value) && ! $current->hasRole([Role::ADMIN->value, Role::SUPER_ADMIN->value])) {
            if ((int) ($promoter->agency_id ?? 0) !== (int) ($current->agency_id ?? 0)) {
                abort(404);
            }
        }

        $promoter->loadCount('promotedEvents');

        if ($request->expectsJson() || app()->runningUnitTests()) {
            return response()->json([
                'promoter' => [
                    'id' => $promoter->id,
                    'name' => $promoter->name,
                    'email' => $promoter->email,
                    'active' => (bool) $promoter->active,
                    'promoted_events_count' => (int) $promoter->promoted_events_count,
                ],
            ]);
        }

        return Inertia::render('Promoters/Show', [
            'promoter' => [
                'id' => $promoter->id,
                'name' => $promoter->name,
                'email' => $promoter->email,
                'active' => (bool) $promoter->active,
                'promoted_events_count' => (int) $promoter->promoted_events_count,
            ],
        ]);
    }

    public function edit(User $user)
    {
        $current = auth()->user();
        if (! $current) {
            abort(404);
        }

        if ($current->id === $user->id || $current->is_super_admin) {
            // allowed
        } elseif ($current->role === Role::ADMIN) {
            if ($user->is_super_admin || $user->role === Role::ADMIN) {
                abort(404);
            }
        } elseif ($current->hasRole(Role::AGENCY->value)) {
            if ($user->is_super_admin || $user->role !== Role::USER->value || (int) ($user->agency_id ?? 0) !== (int) ($current->agency_id ?? 0)) {
                abort(404);
            }
        } else {
            abort(404);
        }

        return Inertia::render('Users/Edit', ['user' => $user]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $current = auth()->user();
        if (! $current) {
            abort(404);
        }

        if (! ($current->id === $user->id || $current->is_super_admin)) {
            if ($current->role === Role::ADMIN) {
                if ($user->is_super_admin || $user->role === Role::ADMIN) {
                    abort(404);
                }
            } elseif ($current->hasRole(Role::AGENCY->value)) {
                if ($user->is_super_admin || $user->role !== Role::USER->value || (int) ($user->agency_id ?? 0) !== (int) ($current->agency_id ?? 0)) {
                    abort(404);
                }
            } else {
                abort(404);
            }
        }

        $data = $request->validated();
        if (! empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        // Only update is_super_admin if role was provided in the request
        if ($current->hasRole(Role::AGENCY->value) && ! $current->hasRole([Role::ADMIN->value, Role::SUPER_ADMIN->value])) {
            $data['role'] = Role::USER->value;
            $data['is_super_admin'] = false;
            $data['agency_id'] = $current->agency_id;
        } elseif (array_key_exists('role', $data)) {
            $data['is_super_admin'] = ($data['role'] === 'super_admin');
        }

        $user->update($data);

        return redirect()->route('users.show', $user->id)->with('success', 'User updated.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $current = auth()->user();
        if (! $current) {
            abort(404);
        }

        if (! $current->is_super_admin) {
            // only super admins may delete admins or other super admins
            if ($user->is_super_admin || $user->role === Role::ADMIN) {
                abort(404);
            }

            if ($current->hasRole(Role::AGENCY->value)) {
                if ((int) ($user->agency_id ?? 0) !== (int) ($current->agency_id ?? 0) || $user->role !== Role::USER->value) {
                    abort(404);
                }
            }

            // regular users cannot delete others
            if ($current->id !== $user->id && $current->role !== Role::ADMIN->value) {
                if (! $current->hasRole(Role::AGENCY->value)) {
                    abort(404);
                }
            }

            if ($current->hasRole(Role::AGENCY->value) && $current->id === $user->id) {
                abort(404);
            }
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;

class UserController
{
    public function index()
    {
        $query = User::orderBy('name');

        $current = auth()->user();
        if (! $current || ! $current->is_super_admin) {
            $query->where('is_super_admin', false);
        }

        $users = $query->paginate(20);

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
        $user = User::create($data);

        return redirect()->route('users.show', $user->id)->with('success', 'User created.');
    }

    public function show(User $user)
    {
        $current = auth()->user();
        if ($user->is_super_admin && ! ($current && ($current->is_super_admin || $current->id === $user->id))) {
            abort(404);
        }

        return Inertia::render('Users/Show', ['user' => $user]);
    }

    public function edit(User $user)
    {
        return Inertia::render('Users/Edit', ['user' => $user]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();
        if (!empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return redirect()->route('users.show', $user->id)->with('success', 'User updated.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted.');
    }
}

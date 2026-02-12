<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Http\Requests\StorePromoterSignupRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PromoterSignupController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Promoters/Signup');
    }

    public function store(StorePromoterSignupRequest $request): RedirectResponse
    {
        $data = $request->validated();

        User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make(Str::random(40)),
            'role' => Role::USER->value,
            'is_super_admin' => false,
            'active' => false,
        ]);

        return redirect()->route('promoters.signup')->with('success', 'Thanks! Your promoter profile was submitted and is pending activation.');
    }
}

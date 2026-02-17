<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrganiserSignupRequest;
use App\Models\Organiser;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrganiserSignupController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Organisers/Signup');
    }

    public function store(StoreOrganiserSignupRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Organiser::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'active' => false,
        ]);

        return redirect()->route('organisers.signup')->with('success', 'Thanks! Your organiser profile was submitted and is pending activation.');
    }
}

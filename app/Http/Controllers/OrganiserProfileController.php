<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateOrganiserPasswordRequest;
use App\Http\Requests\UpdateOrganiserProfileRequest;
use App\Models\Organiser;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class OrganiserProfileController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $organiser = $this->resolveSessionOrganiser($request);
        if (! $organiser) {
            return redirect()->route('organisers.login')->with('error', 'Please sign in as organiser.');
        }

        $user = User::query()->where('email', $organiser->email)->first();

        return Inertia::render('Organisers/Profile', [
            'organiser' => [
                'id' => $organiser->id,
                'name' => $organiser->name,
                'email' => $organiser->email,
            ],
            'hasPassword' => (bool) $user,
        ]);
    }

    public function update(UpdateOrganiserProfileRequest $request): RedirectResponse
    {
        $organiser = $this->resolveSessionOrganiser($request);
        if (! $organiser) {
            return redirect()->route('organisers.login')->with('error', 'Please sign in as organiser.');
        }

        $data = $request->validated();
        $previousEmail = $organiser->email;

        $organiser->update($data);

        $linkedUser = User::query()->where('email', $previousEmail)->first();
        if ($linkedUser) {
            $linkedUser->update([
                'name' => $data['name'],
                'email' => $data['email'],
            ]);
        }

        $request->session()->put('organiser_id', $organiser->id);

        return redirect()->route('organisers.profile')->with('success', 'Profile updated.');
    }

    public function updatePassword(UpdateOrganiserPasswordRequest $request): RedirectResponse
    {
        $organiser = $this->resolveSessionOrganiser($request);
        if (! $organiser) {
            return redirect()->route('organisers.login')->with('error', 'Please sign in as organiser.');
        }

        $data = $request->validated();

        $user = User::query()->where('email', $organiser->email)->first();
        if ($user) {
            $currentPassword = (string) ($data['current_password'] ?? '');
            if ($currentPassword === '' || ! Hash::check($currentPassword, (string) $user->password)) {
                return redirect()->back()->withErrors([
                    'current_password' => 'Current password is incorrect.',
                ])->with('error', 'Password update failed. Please check your current password.');
            }

            $user->update([
                'password' => $data['password'],
            ]);
        } else {
            User::query()->create([
                'name' => $organiser->name,
                'email' => $organiser->email,
                'password' => $data['password'],
                'role' => 'user',
                'active' => true,
                'agency_id' => $organiser->agency_id,
            ]);
        }

        return redirect()->route('organisers.profile')->with('success', 'Password updated.');
    }

    protected function resolveSessionOrganiser(Request $request): ?Organiser
    {
        $organiserId = $request->session()->get('organiser_id');
        if (! $organiserId) {
            return null;
        }

        return Organiser::query()->find($organiserId);
    }
}

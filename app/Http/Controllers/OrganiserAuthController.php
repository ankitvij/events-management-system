<?php

namespace App\Http\Controllers;

use App\Mail\LoginTokenMail;
use App\Models\LoginToken;
use App\Models\Organiser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OrganiserAuthController extends Controller
{
    public function showLogin(): Response
    {
        return Inertia::render('Organisers/Login');
    }

    public function sendToken(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $organiser = Organiser::query()->where('email', $data['email'])->first();
        if (! $organiser) {
            return back()->withErrors(['email' => 'No organiser account found for that email'])->withInput();
        }

        if (! $organiser->active) {
            return back()->withErrors(['email' => 'This organiser account is not active yet.'])->withInput();
        }

        $plain = Str::random(64);
        $hash = hash('sha256', $plain);

        LoginToken::query()
            ->where('type', 'organiser')
            ->where('email', $organiser->email)
            ->delete();

        LoginToken::query()->create([
            'email' => $organiser->email,
            'token_hash' => $hash,
            'type' => 'organiser',
            'expires_at' => now()->addMinutes(30),
        ]);

        $url = route('organisers.login.token.consume', ['token' => $plain]);
        $subject = 'Your organiser sign-in link';
        $intro = 'Click the link below to sign in as organiser.';
        Mail::to($organiser->email)->send(new LoginTokenMail($url, $subject, $intro));

        return redirect()->back()->with('success', 'We emailed you a sign-in link.');
    }

    public function consumeToken(string $token): RedirectResponse
    {
        $hash = hash('sha256', $token);
        $record = LoginToken::query()
            ->valid()
            ->where('type', 'organiser')
            ->where('token_hash', $hash)
            ->firstOrFail();

        $organiser = Organiser::query()->where('email', $record->email)->first();
        if (! $organiser) {
            abort(404);
        }

        if (! $organiser->active) {
            abort(403);
        }

        $record->update(['used_at' => now()]);
        LoginToken::query()
            ->where('type', 'organiser')
            ->where('email', $organiser->email)
            ->whereNull('used_at')
            ->delete();

        session()->put('organiser_id', $organiser->id);

        return redirect()->route('organisers.index')->with('success', 'You are signed in as organiser.');
    }

    public function logout(Request $request): RedirectResponse
    {
        $request->session()->forget('organiser_id');

        return redirect('/')->with('success', 'Logged out');
    }
}

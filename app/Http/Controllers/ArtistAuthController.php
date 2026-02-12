<?php

namespace App\Http\Controllers;

use App\Mail\LoginTokenMail;
use App\Models\Artist;
use App\Models\LoginToken;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ArtistAuthController extends Controller
{
    public function sendToken(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $artist = Artist::query()->where('email', $data['email'])->first();
        if (! $artist) {
            return back()->withErrors(['email' => 'No artist account found for that email'])->withInput();
        }

        if (! $artist->active) {
            return back()->withErrors(['email' => 'This artist account is not active yet. Please verify your email first.'])->withInput();
        }

        $plain = Str::random(64);
        $hash = hash('sha256', $plain);

        LoginToken::query()
            ->where('type', 'artist')
            ->where('artist_id', $artist->id)
            ->delete();

        LoginToken::query()->create([
            'email' => $artist->email,
            'token_hash' => $hash,
            'type' => 'artist',
            'artist_id' => $artist->id,
            'expires_at' => now()->addMinutes(30),
        ]);

        $url = route('artists.login.token.consume', ['token' => $plain]);
        $subject = 'Your artist sign-in link';
        $intro = 'Click the link below to sign in and manage your calendar and bookings.';
        Mail::to($artist->email)->send(new LoginTokenMail($url, $subject, $intro));

        return redirect()->back()->with('success', 'We emailed you a sign-in link.');
    }

    public function consumeToken(string $token): RedirectResponse
    {
        $hash = hash('sha256', $token);
        $record = LoginToken::query()
            ->valid()
            ->where('type', 'artist')
            ->where('token_hash', $hash)
            ->firstOrFail();

        $artist = Artist::query()->find($record->artist_id);
        if (! $artist || $artist->email !== $record->email) {
            abort(404);
        }

        if (! $artist->active) {
            abort(403);
        }

        $record->update(['used_at' => now()]);
        LoginToken::query()
            ->where('type', 'artist')
            ->where('artist_id', $artist->id)
            ->whereNull('used_at')
            ->delete();

        session()->put('artist_id', $artist->id);

        return redirect()->route('artist.calendar')->with('success', 'You are signed in.');
    }

    public function logout(Request $request): RedirectResponse
    {
        $request->session()->forget('artist_id');

        return redirect('/')->with('success', 'Logged out');
    }
}

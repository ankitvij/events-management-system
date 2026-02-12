<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreArtistSignupRequest;
use App\Mail\ArtistVerifyEmail;
use App\Models\Artist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class ArtistSignupController extends Controller
{
    public function store(StoreArtistSignupRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $verifyToken = Str::random(64);

        /** @var Artist $artist */
        $artist = DB::transaction(function () use ($request, $data, $verifyToken) {
            $photoPath = $request->file('photo')->store('artists', 'public');

            return Artist::query()->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'city' => $data['city'],
                'experience_years' => $data['experience_years'],
                'skills' => $data['skills'],
                'description' => $data['description'] ?? null,
                'equipment' => $data['equipment'] ?? null,
                'photo' => $photoPath,
                'active' => false,
                'email_verified_at' => null,
                'verify_token' => $verifyToken,
            ]);
        });

        $verifyUrl = URL::signedRoute('artists.verify', [
            'artist' => $artist->id,
            'token' => $verifyToken,
        ]);

        Mail::to($artist->email)->queue(new ArtistVerifyEmail($artist, $verifyUrl));

        return redirect()->back()->with('success', 'Thanks! Please check your email to verify and activate your artist account.');
    }

    public function verify(Artist $artist, string $token): RedirectResponse
    {
        if (! $artist->verify_token || ! hash_equals($artist->verify_token, $token)) {
            abort(403);
        }

        if (! $artist->email_verified_at) {
            $artist->email_verified_at = now();
        }

        $artist->active = true;
        $artist->verify_token = null;
        $artist->save();

        return redirect('/')->with('success', 'Email verified — your artist account is now active.');
    }
    //
}

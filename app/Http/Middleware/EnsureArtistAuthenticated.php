<?php

namespace App\Http\Middleware;

use App\Models\Artist;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureArtistAuthenticated
{
    public function handle(Request $request, Closure $next): Response
    {
        $artistId = $request->session()->get('artist_id');
        if (! $artistId) {
            return redirect('/')->with('error', 'Please sign in as an artist to continue.');
        }

        $artist = Artist::query()->find($artistId);
        if (! $artist) {
            $request->session()->forget('artist_id');

            return redirect('/')->with('error', 'Please sign in as an artist to continue.');
        }

        if (! $artist->active) {
            return redirect('/')->with('error', 'Your artist account is not active yet.');
        }

        return $next($request);
    }
}

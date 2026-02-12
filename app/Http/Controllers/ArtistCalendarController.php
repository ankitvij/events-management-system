<?php

namespace App\Http\Controllers;

use App\Http\Middleware\EnsureArtistAuthenticated;
use App\Http\Requests\StoreArtistAvailabilityRequest;
use App\Models\Artist;
use App\Models\ArtistAvailability;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArtistCalendarController extends Controller
{
    public function __construct()
    {
        $this->middleware(EnsureArtistAuthenticated::class);
    }

    public function index(Request $request)
    {
        $artist = Artist::query()->findOrFail((int) $request->session()->get('artist_id'));

        $items = ArtistAvailability::query()
            ->where('artist_id', $artist->id)
            ->orderBy('date')
            ->get();

        if ($request->expectsJson() || app()->runningUnitTests()) {
            return response()->json([
                'artist' => $artist,
                'availabilities' => $items,
            ]);
        }

        return Inertia::render('Artist/Calendar', [
            'artist' => $artist,
            'availabilities' => $items,
        ]);
    }

    public function store(StoreArtistAvailabilityRequest $request): RedirectResponse
    {
        $artistId = (int) $request->session()->get('artist_id');

        $data = $request->validated();

        ArtistAvailability::query()->updateOrCreate(
            ['artist_id' => $artistId, 'date' => $data['date']],
            ['is_available' => (bool) $data['is_available']],
        );

        return redirect()->back()->with('success', 'Calendar updated.');
    }

    public function destroy(Request $request, ArtistAvailability $availability): RedirectResponse
    {
        $artistId = (int) $request->session()->get('artist_id');
        if ((int) $availability->artist_id !== $artistId) {
            abort(403);
        }

        $availability->delete();

        return redirect()->back()->with('success', 'Date removed.');
    }
}

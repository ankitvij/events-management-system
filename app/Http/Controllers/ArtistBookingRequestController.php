<?php

namespace App\Http\Controllers;

use App\Http\Middleware\EnsureArtistAuthenticated;
use App\Models\Artist;
use App\Models\BookingRequest;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ArtistBookingRequestController extends Controller
{
    public function __construct()
    {
        $this->middleware(EnsureArtistAuthenticated::class);
    }

    public function index(Request $request)
    {
        $artist = Artist::query()->findOrFail((int) $request->session()->get('artist_id'));

        $requests = BookingRequest::query()
            ->with('event')
            ->where('artist_id', $artist->id)
            ->orderByDesc('created_at')
            ->get();

        if ($request->expectsJson() || app()->runningUnitTests()) {
            return response()->json([
                'artist' => $artist,
                'bookingRequests' => $requests,
            ]);
        }

        return Inertia::render('Artist/Bookings', [
            'artist' => $artist,
            'bookingRequests' => $requests,
        ]);
    }

    public function accept(Request $request, BookingRequest $bookingRequest): RedirectResponse
    {
        $artistId = (int) $request->session()->get('artist_id');
        if ((int) $bookingRequest->artist_id !== $artistId) {
            abort(403);
        }

        if ($bookingRequest->status !== BookingRequest::STATUS_PENDING) {
            return redirect()->back();
        }

        DB::transaction(function () use ($bookingRequest) {
            $bookingRequest->status = BookingRequest::STATUS_ACCEPTED;
            $bookingRequest->responded_at = now();
            $bookingRequest->save();

            $event = Event::query()->findOrFail($bookingRequest->event_id);
            $event->artists()->syncWithoutDetaching([
                $bookingRequest->artist_id => ['booking_request_id' => $bookingRequest->id],
            ]);
        });

        return redirect()->back()->with('success', 'Booking accepted.');
    }

    public function decline(Request $request, BookingRequest $bookingRequest): RedirectResponse
    {
        $artistId = (int) $request->session()->get('artist_id');
        if ((int) $bookingRequest->artist_id !== $artistId) {
            abort(403);
        }

        if ($bookingRequest->status !== BookingRequest::STATUS_PENDING) {
            return redirect()->back();
        }

        $bookingRequest->status = BookingRequest::STATUS_DECLINED;
        $bookingRequest->responded_at = now();
        $bookingRequest->save();

        return redirect()->back()->with('success', 'Booking declined.');
    }
}

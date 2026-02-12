<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequestRequest;
use App\Mail\LoginTokenMail;
use App\Models\Artist;
use App\Models\BookingRequest;
use App\Models\Event;
use App\Models\LoginToken;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class BookingRequestController extends Controller
{
    public function store(StoreBookingRequestRequest $request, Event $event): RedirectResponse
    {
        $current = $request->user();
        if (! $current) {
            abort(403);
        }

        // Only event owner or super admin can send booking requests.
        if (! ($current->is_super_admin || ($event->user_id && $event->user_id === $current->id))) {
            abort(403);
        }

        $data = $request->validated();

        $artist = Artist::query()->findOrFail((int) $data['artist_id']);
        if (! $artist->active) {
            return redirect()->back()->with('error', 'That artist account is not active.');
        }

        $booking = BookingRequest::query()->create([
            'event_id' => $event->id,
            'artist_id' => $artist->id,
            'requested_by_user_id' => $current->id,
            'status' => BookingRequest::STATUS_PENDING,
            'message' => $data['message'] ?? null,
        ]);

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
        $subject = 'New booking request';
        $intro = "You have a new booking request for the event: {$event->title}. Sign in to accept or decline.";
        Mail::to($artist->email)->send(new LoginTokenMail($url, $subject, $intro));

        return redirect()->back()->with('success', 'Booking request sent.');
    }
}

<?php

namespace Tests\Feature;

use App\Models\Artist;
use App\Models\BookingRequest;
use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BookingSystemTest extends TestCase
{
    use RefreshDatabase;

    public function test_artist_can_manage_calendar_dates(): void
    {
        Storage::fake('public');

        $artist = Artist::factory()->create([
            'active' => true,
            'email_verified_at' => now(),
        ]);

        $this->withSession(['artist_id' => $artist->id]);

        $post = $this->post(route('artist.calendar.store'), [
            'date' => now()->addDays(3)->toDateString(),
            'is_available' => true,
        ]);

        $post->assertRedirect();

        $get = $this->get(route('artist.calendar'));
        $get->assertStatus(200);
        $get->assertJsonFragment(['artist_id' => $artist->id]);
    }

    public function test_organiser_can_send_booking_request_and_artist_can_accept_and_become_visible_on_event(): void
    {
        Mail::fake();

        $owner = User::factory()->create(['role' => 'admin', 'is_super_admin' => false]);
        $this->actingAs($owner);

        $event = Event::factory()->create([
            'user_id' => $owner->id,
            'active' => true,
        ]);

        $artist = Artist::factory()->create([
            'active' => true,
            'email_verified_at' => now(),
        ]);

        $send = $this->post(route('events.booking-requests.store', $event), [
            'artist_id' => $artist->id,
            'message' => 'Can you play this event?',
        ]);

        $send->assertRedirect();

        $booking = BookingRequest::query()->where('event_id', $event->id)->where('artist_id', $artist->id)->firstOrFail();
        $this->assertSame(BookingRequest::STATUS_PENDING, $booking->status);

        $this->withSession(['artist_id' => $artist->id]);

        $accept = $this->post(route('artist.bookings.accept', $booking));
        $accept->assertRedirect();

        $booking->refresh();
        $this->assertSame(BookingRequest::STATUS_ACCEPTED, $booking->status);

        $this->assertDatabaseHas('artist_event', [
            'event_id' => $event->id,
            'artist_id' => $artist->id,
            'booking_request_id' => $booking->id,
        ]);

        $show = $this->get(route('events.show', $event));
        $show->assertStatus(200);
        $show->assertJsonFragment(['name' => $artist->name]);
    }

    public function test_artist_can_decline_booking_request(): void
    {
        Mail::fake();

        $owner = User::factory()->create(['role' => 'admin', 'is_super_admin' => false]);
        $this->actingAs($owner);

        $event = Event::factory()->create([
            'user_id' => $owner->id,
            'active' => true,
        ]);

        $artist = Artist::factory()->create([
            'active' => true,
            'email_verified_at' => now(),
        ]);

        $this->post(route('events.booking-requests.store', $event), [
            'artist_id' => $artist->id,
        ])->assertRedirect();

        $booking = BookingRequest::query()->where('event_id', $event->id)->where('artist_id', $artist->id)->firstOrFail();

        $this->withSession(['artist_id' => $artist->id]);

        $decline = $this->post(route('artist.bookings.decline', $booking));
        $decline->assertRedirect();

        $booking->refresh();
        $this->assertSame(BookingRequest::STATUS_DECLINED, $booking->status);

        $this->assertDatabaseMissing('artist_event', [
            'event_id' => $event->id,
            'artist_id' => $artist->id,
        ]);
    }
}

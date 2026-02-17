<?php

namespace Tests\Feature;

use App\Mail\EventOrganiserCreated;
use App\Models\Event;
use App\Models\Organiser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EventVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_created_event_receives_manage_link_without_verification_step(): void
    {
        Mail::fake();
        Storage::fake('public');

        $response = $this->post(route('events.store'), [
            'title' => 'Guest Verification Event',
            'start_at' => now()->addDay()->toDateString(),
            'city' => 'Prague',
            'image' => UploadedFile::fake()->image('event.jpg', 1200, 800),
            'organiser_name' => 'Guest Org',
            'organiser_email' => 'guest@example.test',
            'tickets' => [
                ['name' => 'Standard', 'price' => 0, 'quantity_total' => 10],
            ],
        ]);

        $response->assertRedirect(route('events.index'));
        $response->assertSessionHas('success', 'Event created successfully. An email has been sent. Check the email to manage your event.');

        $event = Event::query()->where('title', 'Guest Verification Event')->firstOrFail();
        $this->assertFalse((bool) $event->active);

        $editUrl = URL::signedRoute('events.edit-link', [
            'event' => $event->slug,
            'token' => $event->edit_token,
        ]);

        $edit = $this->get($editUrl);
        $edit->assertStatus(200);

        Mail::assertSent(EventOrganiserCreated::class, function (EventOrganiserCreated $mail) {
            return $mail->build()->subject === 'ChancePass:"Guest Verification Event" manage.';
        });
    }

    public function test_store_requires_at_least_one_ticket_type(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $this->actingAs($user);

        $organiser = Organiser::create([
            'name' => 'Primary Org',
            'email' => 'primary@example.test',
            'active' => true,
        ]);

        $response = $this->post(route('events.store'), [
            'title' => 'No Tickets Event',
            'start_at' => now()->addDay()->toDateString(),
            'city' => 'Helsinki',
            'organiser_id' => $organiser->id,
            'image' => UploadedFile::fake()->image('event.jpg', 1200, 800),
        ]);

        $response->assertSessionHasErrors('tickets');
    }
}

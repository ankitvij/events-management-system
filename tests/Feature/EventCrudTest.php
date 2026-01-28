<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_read_update_delete_event(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        // Create
        $response = $this->post(route('events.store'), [
            'title' => 'My Test Event',
            'description' => 'Event description',
            'start_at' => now()->addDay()->toDateTimeString(),
            'end_at' => now()->addDays(2)->toDateTimeString(),
            'location' => 'Test Hall',
            'organiser_emails' => 'alice@example.test,bob@example.test',
        ]);

        $response->assertRedirect(route('events.index'));

        $this->assertDatabaseHas('events', [
            'title' => 'My Test Event',
            'location' => 'Test Hall',
            'user_id' => $user->id,
        ]);

        $event = Event::where('title', 'My Test Event')->firstOrFail();

        // organisers created from emails should exist and be attached
        $this->assertDatabaseHas('organisers', ['email' => 'alice@example.test']);
        $this->assertDatabaseHas('organisers', ['email' => 'bob@example.test']);
        $alice = \App\Models\Organiser::where('email', 'alice@example.test')->first();
        $this->assertDatabaseHas('event_organiser', ['event_id' => $event->id, 'organiser_id' => $alice->id]);

        // Read
        $show = $this->get(route('events.show', $event));
        $show->assertStatus(200);

        // Update
        $update = $this->put(route('events.update', $event), [
            'title' => 'Updated Event',
            'description' => 'Updated',
            'start_at' => now()->addDay()->toDateTimeString(),
            'end_at' => now()->addDays(3)->toDateTimeString(),
            'location' => 'Updated Hall',
        ]);

        $update->assertRedirect(route('events.show', $event));

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Updated Event',
            'location' => 'Updated Hall',
        ]);

        // Delete
        $delete = $this->delete(route('events.destroy', $event));
        $delete->assertRedirect(route('events.index'));

        $this->assertDatabaseMissing('events', ['id' => $event->id]);
    }

    public function test_guests_cannot_see_organisers_and_see_placeholder(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        // Create event with organisers via emails
        $response = $this->post(route('events.store'), [
            'title' => 'Public Visibility Event',
            'start_at' => now()->addDay()->toDateTimeString(),
            'location' => 'Test Hall',
            'organiser_emails' => 'alice@example.test,bob@example.test',
        ]);

        $response->assertRedirect(route('events.index'));

        $event = Event::where('title', 'Public Visibility Event')->firstOrFail();

        // Logout to simulate guest
        auth()->logout();

        $index = $this->get(route('events.index'));
        $index->assertStatus(200);
        $index->assertJsonFragment(['showOrganisers' => false]);

        $show = $this->get(route('events.show', $event));
        $show->assertStatus(200);
        $show->assertJsonFragment(['showOrganisers' => false]);
    }

    public function test_authenticated_users_see_organisers(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('events.store'), [
            'title' => 'Auth Visibility Event',
            'start_at' => now()->addDay()->toDateTimeString(),
            'location' => 'Test Hall',
            'organiser_emails' => 'alice2@example.test,bob2@example.test',
        ]);

        $response->assertRedirect(route('events.index'));

        $event = Event::where('title', 'Auth Visibility Event')->firstOrFail();

        $index = $this->get(route('events.index'));
        $index->assertStatus(200);
        $index->assertJsonFragment(['showOrganisers' => true]);
        $index->assertJsonFragment(['email' => 'alice2@example.test']);

        $show = $this->get(route('events.show', $event));
        $show->assertStatus(200);
        $show->assertJsonFragment(['showOrganisers' => true]);
        $show->assertJsonFragment(['email' => 'alice2@example.test']);
    }
}

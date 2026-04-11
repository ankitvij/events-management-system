<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Organiser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganiserProfileAndEventEditTest extends TestCase
{
    use RefreshDatabase;

    public function test_organiser_can_view_profile_page_when_logged_in_with_session(): void
    {
        $organiser = Organiser::query()->create([
            'name' => 'Session Organiser',
            'email' => 'session-organiser@example.test',
            'active' => true,
        ]);

        $response = $this->withSession(['organiser_id' => $organiser->id])
            ->get(route('organisers.profile'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Organisers/Profile')
            ->where('organiser.id', $organiser->id)
            ->where('organiser.email', $organiser->email)
        );
    }

    public function test_organiser_can_update_profile_and_linked_user_email(): void
    {
        $organiser = Organiser::query()->create([
            'name' => 'Before Name',
            'email' => 'before@example.test',
            'active' => true,
        ]);

        $user = User::factory()->create([
            'name' => 'Before Name',
            'email' => 'before@example.test',
        ]);

        $response = $this->withSession(['organiser_id' => $organiser->id])
            ->put(route('organisers.profile.update'), [
                'name' => 'After Name',
                'email' => 'after@example.test',
            ]);

        $response->assertRedirect(route('organisers.profile'));

        $this->assertDatabaseHas('organisers', [
            'id' => $organiser->id,
            'name' => 'After Name',
            'email' => 'after@example.test',
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'After Name',
            'email' => 'after@example.test',
        ]);
    }

    public function test_organiser_can_set_password_when_linked_user_does_not_exist(): void
    {
        $organiser = Organiser::query()->create([
            'name' => 'Password Organiser',
            'email' => 'password-organiser@example.test',
            'active' => true,
        ]);

        $response = $this->withSession(['organiser_id' => $organiser->id])
            ->put(route('organisers.profile.password.update'), [
                'password' => 'new-password-123',
                'password_confirmation' => 'new-password-123',
            ]);

        $response->assertRedirect(route('organisers.profile'));
        $this->assertDatabaseHas('users', [
            'email' => $organiser->email,
            'name' => $organiser->name,
        ]);
    }

    public function test_organiser_can_update_owned_event_via_organiser_route(): void
    {
        $owner = User::factory()->create();
        $organiser = Organiser::query()->create([
            'name' => 'Main Organiser',
            'email' => 'main-organiser@example.test',
            'active' => true,
        ]);

        $event = Event::factory()->create([
            'title' => 'Original Event',
            'city' => 'Berlin',
            'country' => 'Germany',
            'organiser_id' => $organiser->id,
            'user_id' => $owner->id,
        ]);
        $event->organisers()->sync([$organiser->id]);

        $response = $this->withSession(['organiser_id' => $organiser->id])
            ->put(route('events.organiser.update', $event), [
                'title' => 'Updated By Organiser',
                'description' => 'Updated details',
                'start_at' => now()->addDays(5)->toDateString(),
                'end_at' => now()->addDays(6)->toDateString(),
                'city' => 'Munich',
                'country' => 'Germany',
                'address' => 'Street 123',
                'organiser_id' => $organiser->id,
                'organiser_ids' => [$organiser->id],
            ]);

        $event->refresh();

        $response->assertRedirect(route('events.show', $event));
        $this->assertSame('Updated By Organiser', $event->title);
        $this->assertSame('Munich', $event->city);
    }

    public function test_organiser_edit_page_uses_organiser_update_endpoint(): void
    {
        $owner = User::factory()->create();
        $organiser = Organiser::query()->create([
            'name' => 'Edit Organiser',
            'email' => 'edit-organiser@example.test',
            'active' => true,
        ]);

        $event = Event::factory()->create([
            'title' => 'Editable Event',
            'city' => 'Rome',
            'organiser_id' => $organiser->id,
            'user_id' => $owner->id,
        ]);
        $event->organisers()->sync([$organiser->id]);

        $response = $this->withSession(['organiser_id' => $organiser->id])
            ->get(route('events.organiser.edit', $event));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Events/Edit')
            ->where('editUrl', route('events.organiser.update', $event))
        );
    }

    public function test_organiser_cannot_update_event_they_do_not_own(): void
    {
        $owner = User::factory()->create();
        $eventOrganiser = Organiser::query()->create([
            'name' => 'Event Organiser',
            'email' => 'event-organiser@example.test',
            'active' => true,
        ]);
        $otherOrganiser = Organiser::query()->create([
            'name' => 'Other Organiser',
            'email' => 'other-organiser@example.test',
            'active' => true,
        ]);

        $event = Event::factory()->create([
            'title' => 'Restricted Event',
            'city' => 'Madrid',
            'country' => 'Spain',
            'organiser_id' => $eventOrganiser->id,
            'user_id' => $owner->id,
        ]);
        $event->organisers()->sync([$eventOrganiser->id]);

        $response = $this->withSession(['organiser_id' => $otherOrganiser->id])
            ->put(route('events.organiser.update', $event), [
                'title' => 'Attempted Update',
                'start_at' => now()->addDays(1)->toDateString(),
                'end_at' => now()->addDays(2)->toDateString(),
                'city' => 'Madrid',
                'organiser_id' => $eventOrganiser->id,
            ]);

        $response->assertForbidden();
    }

    public function test_organiser_cannot_view_edit_page_for_event_they_do_not_own(): void
    {
        $owner = User::factory()->create();
        $eventOrganiser = Organiser::query()->create([
            'name' => 'Owner Organiser',
            'email' => 'owner-organiser@example.test',
            'active' => true,
        ]);
        $otherOrganiser = Organiser::query()->create([
            'name' => 'Outside Organiser',
            'email' => 'outside-organiser@example.test',
            'active' => true,
        ]);

        $event = Event::factory()->create([
            'title' => 'Private Edit Event',
            'city' => 'Lisbon',
            'country' => 'Portugal',
            'organiser_id' => $eventOrganiser->id,
            'user_id' => $owner->id,
        ]);
        $event->organisers()->sync([$eventOrganiser->id]);

        $response = $this->withSession(['organiser_id' => $otherOrganiser->id])
            ->get(route('events.organiser.edit', $event));

        $response->assertNotFound();
    }

    public function test_my_events_list_only_shows_events_for_logged_in_organiser(): void
    {
        $owner = User::factory()->create();

        $loggedInOrganiser = Organiser::query()->create([
            'name' => 'Logged In Organiser',
            'email' => 'logged-in-organiser@example.test',
            'active' => true,
        ]);

        $otherOrganiser = Organiser::query()->create([
            'name' => 'Other Organiser',
            'email' => 'other-visible-organiser@example.test',
            'active' => true,
        ]);

        $ownedEvent = Event::factory()->create([
            'title' => 'Owned Event',
            'slug' => 'owned-event',
            'organiser_id' => $loggedInOrganiser->id,
            'user_id' => $owner->id,
            'active' => false,
        ]);
        $ownedEvent->organisers()->sync([$loggedInOrganiser->id]);

        $otherEvent = Event::factory()->create([
            'title' => 'Other Event',
            'slug' => 'other-event',
            'organiser_id' => $otherOrganiser->id,
            'user_id' => $owner->id,
            'active' => true,
        ]);
        $otherEvent->organisers()->sync([$otherOrganiser->id]);

        $response = $this->withSession(['organiser_id' => $loggedInOrganiser->id])
            ->get(route('events.index'));

        $response->assertOk();
        $response->assertJsonPath('events.data.0.slug', 'owned-event');
        $response->assertJsonCount(1, 'events.data');
    }
}

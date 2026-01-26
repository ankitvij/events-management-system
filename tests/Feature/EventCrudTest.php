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
        ]);

        $response->assertRedirect(route('events.index'));

        $this->assertDatabaseHas('events', [
            'title' => 'My Test Event',
            'location' => 'Test Hall',
            'user_id' => $user->id,
        ]);

        $event = Event::where('title', 'My Test Event')->firstOrFail();

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
}

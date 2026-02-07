<?php

namespace Tests\Feature;

use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventSlugRoutingTest extends TestCase
{
    use RefreshDatabase;

    public function test_event_show_uses_slug_route_key(): void
    {
        $event = Event::factory()->create([
            'slug' => 'sample-event-123abc',
            'active' => true,
        ]);

        $this->get("/{$event->slug}")->assertOk();
        $this->get("/events/{$event->slug}")->assertRedirect("/{$event->slug}");
        $this->get("/events/{$event->id}")->assertRedirect("/{$event->slug}");
    }
}

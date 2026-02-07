<?php

namespace Tests\Feature;

use App\Models\Event;
use Database\Seeders\EventsTableSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventsTableSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_events_table_seeder_populates_address_and_city(): void
    {
        $this->seed(EventsTableSeeder::class);

        $this->assertDatabaseCount('events', 5);

        $this->assertDatabaseHas('events', [
            'title' => 'Community Meetup: Laravel Tips',
            'address' => 'City Library Conference Room',
            'city' => 'Berlin',
            'country' => 'Germany',
        ]);

        $event = Event::query()->where('title', 'Design Review')->firstOrFail();

        $this->assertSame('Remote - Zoom', $event->address);
        $this->assertSame('Remote', $event->city);
        $this->assertNull($event->country);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventsSearchSortTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_filters_events()
    {
        Event::factory()->create(['title' => 'FindMe Event', 'city' => 'Somewhere']);
        Event::factory()->create(['title' => 'Other Event', 'city' => 'Elsewhere']);

        $resp = $this->getJson('/events?search=FindMe');
        $resp->assertStatus(200);
        $data = $resp->json('events.data');
        $this->assertCount(1, $data);
        $this->assertStringContainsString('FindMe', $data[0]['title']);
    }

    public function test_sort_orders_events_by_start()
    {
        $a = Event::factory()->create(['title' => 'A Event', 'start_at' => now()->addDays(2)]);
        $b = Event::factory()->create(['title' => 'B Event', 'start_at' => now()->addDays(5)]);

        $resp = $this->getJson('/events?sort=start_asc');
        $resp->assertStatus(200);
        $data = $resp->json('events.data');
        $this->assertGreaterThanOrEqual(2, count($data));
        $this->assertEquals('A Event', $data[0]['title']);
    }
}

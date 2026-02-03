<?php

namespace Tests\Feature;

use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicEventsFilteringTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // create a few events with varying attributes
        Event::factory()->create(['title' => 'Alpha Party', 'city' => 'CityA', 'country' => 'CountryX', 'active' => true]);
        Event::factory()->create(['title' => 'Beta Gala', 'city' => 'CityB', 'country' => 'CountryY', 'active' => true]);
        Event::factory()->create(['title' => 'Gamma Meetup', 'city' => 'CityA', 'country' => 'CountryY', 'active' => true]);
        Event::factory()->create(['title' => 'Old Event', 'city' => 'CityC', 'country' => 'CountryZ', 'active' => false]);
    }

    public function test_search_filters_by_title_and_description()
    {
        $res = $this->getJson('/events?q=Alpha');
        $res->assertStatus(200);
        $data = $res->json('events.data');
        $this->assertCount(1, $data);
        $this->assertStringContainsString('Alpha', $data[0]['title']);
    }

    public function test_city_filter_returns_matching_city()
    {
        $res = $this->getJson('/events?city=CityA');
        $res->assertStatus(200);
        $data = $res->json('events.data');
        $this->assertGreaterThanOrEqual(1, count($data));
        foreach ($data as $row) {
            $this->assertEquals('CityA', $row['city']);
        }
    }

    public function test_country_filter_returns_matching_country()
    {
        $res = $this->getJson('/events?country=CountryY');
        $res->assertStatus(200);
        $data = $res->json('events.data');
        $this->assertGreaterThanOrEqual(1, count($data));
        foreach ($data as $row) {
            $this->assertEquals('CountryY', $row['country']);
        }
    }

    public function test_sort_title_asc_orders_results()
    {
        $res = $this->getJson('/events?sort=title_asc');
        $res->assertStatus(200);
        $data = array_column($res->json('events.data'), 'title');
        $sorted = $data;
        sort($sorted, SORT_STRING);
        $this->assertEquals($sorted, $data);
    }

    public function test_inactive_filter_shows_inactive()
    {
        $res = $this->getJson('/events?active=inactive');
        $res->assertStatus(200);
        $data = $res->json('events.data');
        $this->assertGreaterThanOrEqual(1, count($data));
        foreach ($data as $row) {
            $this->assertFalse((bool) $row['active']);
        }
    }
}

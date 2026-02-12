<?php

namespace Tests\Feature;

use App\Models\Artist;
use App\Models\BookingRequest;
use App\Models\Event;
use App\Models\Order;
use App\Models\Page;
use App\Models\Ticket;
use App\Models\Vendor;
use Database\Seeders\EverythingSampleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EverythingSampleSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['seeding.allow_sample_data' => true]);
    }

    public function test_everything_sample_seeder_populates_core_entities_and_links(): void
    {
        $this->seed(EverythingSampleSeeder::class);

        $this->assertGreaterThanOrEqual(10, Artist::query()->count());
        $this->assertGreaterThanOrEqual(10, Vendor::query()->count());
        $this->assertGreaterThanOrEqual(10, Event::query()->count());
        $this->assertGreaterThanOrEqual(10, Ticket::query()->count());
        $this->assertGreaterThanOrEqual(1, BookingRequest::query()->count());
        $this->assertGreaterThanOrEqual(1, Order::query()->count());
        $this->assertGreaterThanOrEqual(2, Page::query()->count());

        $event = Event::query()->whereNotNull('image')->firstOrFail();
        $this->assertNotNull($event->image);

        $artist = Artist::query()->whereNotNull('photo')->firstOrFail();
        $this->assertNotNull($artist->photo);
        $this->assertIsArray($artist->artist_types);
        $this->assertNotEmpty($artist->artist_types);

        $linkedEvent = Event::query()->has('artists')->has('vendors')->firstOrFail();
        $this->assertGreaterThan(0, $linkedEvent->artists()->count());
        $this->assertGreaterThan(0, $linkedEvent->vendors()->count());
        $this->assertGreaterThan(0, $linkedEvent->promoters()->count());
    }
}

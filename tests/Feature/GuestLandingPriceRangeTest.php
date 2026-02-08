<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuestLandingPriceRangeTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_landing_includes_ticket_price_range(): void
    {
        $event = Event::factory()->create([
            'active' => true,
        ]);

        Ticket::query()->create([
            'event_id' => $event->id,
            'name' => 'Standard',
            'price' => 10,
            'quantity_total' => 50,
            'quantity_available' => 25,
            'active' => true,
        ]);

        Ticket::query()->create([
            'event_id' => $event->id,
            'name' => 'VIP',
            'price' => 25,
            'quantity_total' => 20,
            'quantity_available' => 10,
            'active' => true,
        ]);

        $response = $this->get(route('home'))
            ->assertOk();

        $minPrice = $response->json('events.data.0.min_ticket_price');
        $maxPrice = $response->json('events.data.0.max_ticket_price');

        $this->assertSame('10.00', number_format((float) $minPrice, 2, '.', ''));
        $this->assertSame('25.00', number_format((float) $maxPrice, 2, '.', ''));
    }
}

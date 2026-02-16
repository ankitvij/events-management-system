<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderIndexSearchSortTest extends TestCase
{
    use RefreshDatabase;

    public function test_orders_index_can_search_by_booking_code_customer_and_event_name(): void
    {
        $admin = User::factory()->create();

        $rockEvent = Event::factory()->create(['title' => 'Rock Fest']);
        $jazzEvent = Event::factory()->create(['title' => 'Jazz Night']);

        $rockTicket = Ticket::query()->create([
            'event_id' => $rockEvent->id,
            'name' => 'Rock Ticket',
            'price' => 20,
            'quantity_total' => 10,
            'quantity_available' => 10,
            'active' => true,
        ]);

        $jazzTicket = Ticket::query()->create([
            'event_id' => $jazzEvent->id,
            'name' => 'Jazz Ticket',
            'price' => 20,
            'quantity_total' => 10,
            'quantity_available' => 10,
            'active' => true,
        ]);

        $orderA = Order::factory()->create([
            'booking_code' => 'BOOK-ROCK-1',
            'contact_name' => 'Alice Rock',
            'contact_email' => 'alice@example.test',
        ]);

        $orderB = Order::factory()->create([
            'booking_code' => 'BOOK-JAZZ-2',
            'contact_name' => 'Bob Jazz',
            'contact_email' => 'bob@example.test',
        ]);

        OrderItem::query()->create([
            'order_id' => $orderA->id,
            'ticket_id' => $rockTicket->id,
            'event_id' => $rockEvent->id,
            'quantity' => 1,
            'price' => 20,
        ]);

        OrderItem::query()->create([
            'order_id' => $orderB->id,
            'ticket_id' => $jazzTicket->id,
            'event_id' => $jazzEvent->id,
            'quantity' => 1,
            'price' => 20,
        ]);

        $byBooking = $this->actingAs($admin)->get('/orders?q=BOOK-ROCK-1');
        $byBooking->assertStatus(200);
        $byBooking->assertSee('BOOK-ROCK-1');
        $byBooking->assertDontSee('BOOK-JAZZ-2');

        $byCustomer = $this->actingAs($admin)->get('/orders?q=Alice Rock');
        $byCustomer->assertStatus(200);
        $byCustomer->assertSee('Alice Rock');
        $byCustomer->assertDontSee('Bob Jazz');

        $byEvent = $this->actingAs($admin)->get('/orders?q=Rock Fest');
        $byEvent->assertStatus(200);
        $byEvent->assertSee('BOOK-ROCK-1');
        $byEvent->assertDontSee('BOOK-JAZZ-2');
    }

    public function test_orders_index_can_sort_by_booking_code(): void
    {
        $admin = User::factory()->create();

        Order::factory()->create([
            'booking_code' => 'ZZZ-999',
            'contact_name' => 'Last Person',
            'contact_email' => 'last@example.test',
        ]);

        Order::factory()->create([
            'booking_code' => 'AAA-111',
            'contact_name' => 'First Person',
            'contact_email' => 'first@example.test',
        ]);

        $response = $this->actingAs($admin)->get('/orders?sort=booking_code_asc');

        $response->assertStatus(200);
        $response->assertSeeInOrder(['AAA-111', 'ZZZ-999']);
    }
}

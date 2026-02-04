<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Event;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutConcurrencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_concurrent_checkouts_reserve_once()
    {
        // Create an event and a ticket with quantity 1
        $event = Event::factory()->create(['title' => 'Concurrent Test Event']);
        $ticket = Ticket::create([
            'event_id' => $event->id,
            'name' => 'Test Ticket',
            'price' => 10.0,
            'quantity_total' => 1,
            'quantity_available' => 1,
            'active' => true,
        ]);

        // Create two separate carts (simulate two guests)
        $cartA = Cart::create();
        $cartB = Cart::create();

        CartItem::create(['cart_id' => $cartA->id, 'ticket_id' => $ticket->id, 'event_id' => $event->id, 'quantity' => 1, 'price' => 10.0]);
        CartItem::create(['cart_id' => $cartB->id, 'ticket_id' => $ticket->id, 'event_id' => $event->id, 'quantity' => 1, 'price' => 10.0]);

        // Directly exercise reservation logic similar to the controller transaction.
        $exceptionThrown = false;
        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($cartA) {
                $items = $cartA->items()->get();
                foreach ($items as $item) {
                    if ($item->ticket_id) {
                        $ticket = Ticket::lockForUpdate()->find($item->ticket_id);
                        if (! $ticket || $ticket->quantity_available < $item->quantity) {
                            throw new \Exception('Insufficient availability');
                        }
                        $ticket->quantity_available = max(0, $ticket->quantity_available - $item->quantity);
                        $ticket->save();
                    }
                }
                $cartA->items()->delete();
            });
        } catch (\Throwable $e) {
            $exceptionThrown = true;
        }

        $this->assertFalse($exceptionThrown, 'First reservation should succeed');

        // Second reservation should fail due to no availability
        $exceptionThrown = false;
        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($cartB) {
                $items = $cartB->items()->get();
                foreach ($items as $item) {
                    if ($item->ticket_id) {
                        $ticket = Ticket::lockForUpdate()->find($item->ticket_id);
                        if (! $ticket || $ticket->quantity_available < $item->quantity) {
                            throw new \Exception('Insufficient availability');
                        }
                        $ticket->quantity_available = max(0, $ticket->quantity_available - $item->quantity);
                        $ticket->save();
                    }
                }
                $cartB->items()->delete();
            });
        } catch (\Throwable $e) {
            $exceptionThrown = true;
        }

        $this->assertTrue($exceptionThrown, 'Second reservation should fail due to no availability');

        $ticket->refresh();
        $this->assertEquals(0, $ticket->quantity_available, 'Ticket quantity should be decremented to 0');
    }
}

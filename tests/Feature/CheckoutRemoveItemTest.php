<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Event;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutRemoveItemTest extends TestCase
{
    use RefreshDatabase;

    public function test_cart_item_can_be_removed(): void
    {
        $event = Event::factory()->create();
        $ticket = Ticket::create([
            'event_id' => $event->id,
            'name' => 'Remove Ticket',
            'price' => 10.0,
            'quantity_total' => 5,
            'quantity_available' => 5,
            'active' => true,
        ]);

        $cart = Cart::create(['session_id' => 'remove-test']);
        $item = CartItem::create([
            'cart_id' => $cart->id,
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
            'quantity' => 1,
            'price' => 10.0,
        ]);

        $response = $this->deleteJson("/cart/items/{$item->id}");

        $response->assertOk();
        $response->assertJson(['success' => true]);
        $this->assertDatabaseMissing('cart_items', ['id' => $item->id]);
    }
}

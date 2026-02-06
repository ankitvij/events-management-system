<?php

namespace Tests\Feature;

use App\Mail\OrderConfirmed;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Customer;
use App\Models\Event;
use App\Models\Order;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class CheckoutCreatesCustomerTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_with_create_account_creates_customer_and_associates_order()
    {
        Mail::fake();

        // prepare a cart with one ticket item
        $event = Event::factory()->create(['title' => 'Checkout Test Event']);
        $ticket = Ticket::create([
            'event_id' => $event->id,
            'name' => 'Test Ticket',
            'price' => 10.0,
            'quantity_total' => 5,
            'quantity_available' => 5,
            'active' => true,
        ]);
        $cart = Cart::create(['session_id' => 'test-session']);
        $item = CartItem::create([
            'cart_id' => $cart->id,
            'quantity' => 1,
            'price' => 10.0,
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
        ]);

        $post = [
            'name' => 'Checkout Customer',
            'email' => 'checkout@example.com',
            'password' => 'checkoutpass',
            'cart_id' => $cart->id,
            'ticket_guests' => [
                [
                    'cart_item_id' => $item->id,
                    'guests' => [
                        ['name' => 'Ticket Holder', 'email' => 'holder@example.com'],
                    ],
                ],
            ],
        ];

        $res = $this->post('/cart/checkout', $post);
        $res->assertStatus(302);

        $this->assertDatabaseHas('customers', ['email' => 'checkout@example.com']);
        $customer = Customer::where('email', 'checkout@example.com')->first();
        $this->assertNotNull($customer);

        $order = Order::latest()->first();
        $this->assertNotNull($order);
        $this->assertEquals($customer->id, $order->customer_id);

        $order->load('items');
        $details = $order->items->first()->guest_details ?? [];
        $this->assertEquals('holder@example.com', $details[0]['email'] ?? null);

        Mail::assertSent(OrderConfirmed::class, function (OrderConfirmed $mail) {
            return $mail->hasTo('holder@example.com');
        });

        Mail::assertSent(OrderConfirmed::class, function (OrderConfirmed $mail) {
            return $mail->hasTo('checkout@example.com');
        });
    }
}

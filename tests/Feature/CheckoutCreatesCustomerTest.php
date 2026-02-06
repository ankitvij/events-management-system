<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutCreatesCustomerTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_with_create_account_creates_customer_and_associates_order()
    {
        // prepare a cart with one item
        $cart = Cart::create(['session_id' => 'test-session']);
        CartItem::create(['cart_id' => $cart->id, 'quantity' => 1, 'price' => 10.0, 'ticket_id' => null, 'event_id' => null]);

        $post = [
            'name' => 'Checkout Customer',
            'email' => 'checkout@example.com',
            'password' => 'checkoutpass',
            'cart_id' => $cart->id,
        ];

        $res = $this->post('/cart/checkout', $post);
        $res->assertStatus(302);

        $this->assertDatabaseHas('customers', ['email' => 'checkout@example.com']);
        $customer = Customer::where('email', 'checkout@example.com')->first();
        $this->assertNotNull($customer);

        $order = Order::latest()->first();
        $this->assertNotNull($order);
        $this->assertEquals($customer->id, $order->customer_id);
    }
}

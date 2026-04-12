<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Event;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;
use Tests\TestCase;

class CartStripeCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_redirects_to_stripe_hosted_checkout_for_stripe_method(): void
    {
        Session::start();

        config()->set('services.stripe.secret_key', 'sk_test_123');

        Http::fake([
            'https://api.stripe.com/v1/checkout/sessions' => Http::response([
                'id' => 'cs_test_123',
                'url' => 'https://checkout.stripe.com/c/pay/cs_test_123',
            ], 200),
        ]);

        $event = Event::factory()->create();
        $cart = Cart::create(['session_id' => Session::getId()]);
        CartItem::create([
            'cart_id' => $cart->id,
            'event_id' => $event->id,
            'quantity' => 2,
            'price' => 25.00,
        ]);

        $response = $this->postJson('/cart/checkout', [
            'name' => 'Stripe Customer',
            'email' => 'stripe@example.com',
            'payment_method' => 'stripe_transfer',
            'cart_id' => $cart->id,
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('checkout_url', 'https://checkout.stripe.com/c/pay/cs_test_123');

        $this->assertDatabaseHas('orders', [
            'payment_method' => 'stripe_transfer',
            'stripe_checkout_session_id' => 'cs_test_123',
            'paid' => false,
            'total' => '52.00',
        ]);

        Http::assertSent(function ($request): bool {
            return $request->url() === 'https://api.stripe.com/v1/checkout/sessions'
                && (string) ($request['line_items[1][price_data][product_data][name]'] ?? '') === 'eCard payment fee'
                && (string) ($request['line_items[1][price_data][unit_amount]'] ?? '') === '200';
        });
    }

    public function test_stripe_success_marks_order_as_paid(): void
    {
        config()->set('services.stripe.secret_key', 'sk_test_123');

        $order = Order::create([
            'booking_code' => 'STRIPE1234',
            'status' => 'pending',
            'payment_method' => 'stripe_transfer',
            'payment_status' => 'pending',
            'total' => 50.00,
            'paid' => false,
            'stripe_checkout_session_id' => 'cs_test_success',
        ]);

        Http::fake([
            'https://api.stripe.com/v1/checkout/sessions/cs_test_success*' => Http::response([
                'id' => 'cs_test_success',
                'payment_status' => 'paid',
                'payment_intent' => 'pi_test_123',
                'metadata' => [
                    'order_id' => (string) $order->id,
                ],
            ], 200),
        ]);

        $response = $this->get(route('cart.checkout.stripe.success', ['order' => $order->id], false).'?session_id=cs_test_success&booking_code='.$order->booking_code);

        $response->assertRedirect(route('orders.show', ['order' => $order->id, 'booking_code' => $order->booking_code], false));

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'paid',
            'payment_status' => 'paid',
            'paid' => true,
            'stripe_checkout_session_id' => 'cs_test_success',
            'stripe_payment_intent_id' => 'pi_test_123',
        ]);
    }
}

<?php

namespace Tests\Feature;

use App\Mail\LoginTokenMail;
use App\Mail\OrderConfirmed;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Customer;
use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class CustomerEndToEndFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_buy_ticket_receive_email_login_with_token_and_view_the_order(): void
    {
        Mail::fake();

        $event = Event::factory()->create();
        $ticket = Ticket::query()->create([
            'event_id' => $event->id,
            'name' => 'E2E Ticket',
            'price' => 12.50,
            'quantity_total' => 10,
            'quantity_available' => 10,
            'active' => true,
        ]);

        $cart = Cart::query()->create();
        $item = CartItem::query()->create([
            'cart_id' => $cart->id,
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
            'quantity' => 1,
            'price' => 12.50,
        ]);

        $checkout = $this->postJson('/cart/checkout', [
            'cart_id' => $cart->id,
            'name' => 'Buyer User',
            'email' => 'buyer@example.test',
            'password' => 'secret123',
            'payment_method' => 'bank_transfer',
            'ticket_guests' => [
                [
                    'cart_item_id' => $item->id,
                    'guests' => [
                        ['name' => 'Ticket Holder', 'email' => 'holder@example.test'],
                    ],
                ],
            ],
        ]);

        $checkout->assertOk()->assertJson(['success' => true]);

        $order = Order::query()->latest()->first();
        $this->assertNotNull($order);
        $this->assertNotNull($order->customer_id);

        Mail::assertSent(OrderConfirmed::class, function (OrderConfirmed $mail) {
            return $mail->hasTo('holder@example.test') || $mail->hasTo('buyer@example.test');
        });

        $requestToken = $this->from('/customer/login')->post('/customer/login', [
            'email' => 'buyer@example.test',
            'password' => '',
        ]);

        $requestToken->assertRedirect('/customer/login');
        $requestToken->assertSessionHas('status', 'We emailed you a sign-in link.');

        $loginUrl = null;
        Mail::assertSent(LoginTokenMail::class, function (LoginTokenMail $mail) use (&$loginUrl) {
            $loginUrl = $mail->loginUrl;

            return $mail->hasTo('buyer@example.test');
        });

        $this->assertNotNull($loginUrl);

        $consume = $this->get($loginUrl);
        $consume->assertRedirect(route('customer.orders'));

        $this->assertSame((int) $order->customer_id, (int) session('customer_id'));

        $orders = $this->getJson('/customer/orders');
        $orders->assertOk();
        $orders->assertJsonFragment(['booking_code' => $order->booking_code]);

        $display = $this->get('/orders/'.$order->id.'/display');
        $display->assertOk();
    }

    public function test_customer_can_login_with_password_view_all_orders_download_and_resend_ticket(): void
    {
        if (! class_exists('\\Barryvdh\\DomPDF\\Facade\\Pdf') && ! class_exists('\\Dompdf\\Dompdf')) {
            $this->markTestSkipped('Dompdf not available');
        }

        Mail::fake();

        $customer = Customer::factory()->create([
            'name' => 'Password Customer',
            'email' => 'password-customer@example.test',
            'password' => Hash::make('secret123'),
        ]);

        $event = Event::factory()->create();
        $ticket = Ticket::query()->create([
            'event_id' => $event->id,
            'name' => 'Password Flow Ticket',
            'price' => 20.00,
            'quantity_total' => 5,
            'quantity_available' => 5,
            'active' => true,
        ]);

        $firstOrder = Order::query()->create([
            'status' => 'paid',
            'total' => 20.00,
            'contact_name' => $customer->name,
            'contact_email' => $customer->email,
            'booking_code' => 'PWD123',
            'paid' => true,
            'customer_id' => $customer->id,
        ]);

        $firstItem = OrderItem::query()->create([
            'order_id' => $firstOrder->id,
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
            'quantity' => 1,
            'price' => 20.00,
            'guest_details' => [
                ['name' => 'Guest One', 'email' => 'guest-one@example.test'],
            ],
        ]);

        Order::query()->create([
            'status' => 'paid',
            'total' => 10.00,
            'contact_name' => $customer->name,
            'contact_email' => $customer->email,
            'booking_code' => 'PWD456',
            'paid' => true,
            'customer_id' => $customer->id,
        ]);

        $login = $this->post('/customer/login', [
            'email' => $customer->email,
            'password' => 'secret123',
        ]);

        $login->assertRedirect(route('customer.orders'));
        $this->assertSame($customer->id, session('customer_id'));

        $orders = $this->getJson('/customer/orders');
        $orders->assertOk();
        $orders->assertJsonCount(2, 'orders.data');

        $download = $this->get(route('orders.tickets.download', [$firstOrder, $firstItem], false));
        $download->assertOk();
        $download->assertHeader('Content-Type', 'application/pdf');

        $resend = $this->postJson('/orders/send-ticket', [
            'booking_code' => $firstOrder->booking_code,
            'email' => $customer->email,
        ]);

        $resend->assertOk()->assertJson(['message' => 'Email sent']);

        Mail::assertSent(OrderConfirmed::class);
    }
}

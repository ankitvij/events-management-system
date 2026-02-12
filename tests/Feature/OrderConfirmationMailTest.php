<?php

namespace Tests\Feature;

use App\Mail\OrderConfirmed;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class OrderConfirmationMailTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_confirmation_email_contains_signed_link_for_contact_email(): void
    {
        $order = Order::factory()->create([
            'contact_email' => 'buyer@example.com',
        ]);

        $mailable = new OrderConfirmed(order: $order, recipientEmail: 'buyer@example.com');
        $html = $mailable->render();

        $signedUrl = URL::signedRoute('orders.display', [
            'order' => $order->id,
            'email' => 'buyer@example.com',
        ]);

        $this->assertStringContainsString('signature=', $signedUrl);
        $this->assertStringContainsString(htmlspecialchars($signedUrl, ENT_QUOTES, 'UTF-8', false), $html);
        $this->assertStringContainsString('View your order', $html);

        $this->get($signedUrl)->assertStatus(200);
    }

    public function test_order_confirmation_email_uses_ticket_holder_email_when_provided(): void
    {
        $order = Order::factory()->create([
            'contact_email' => 'guest@example.com',
        ]);

        $mailable = new OrderConfirmed(order: $order, item: null, ticketHolderName: 'Guest Name', ticketHolderEmail: 'guest@example.com', recipientEmail: 'guest@example.com', isTicketHolderMail: true);
        $html = $mailable->render();

        $signedUrl = URL::signedRoute('orders.display', [
            'order' => $order->id,
            'email' => 'guest@example.com',
        ]);

        $this->assertStringContainsString('signature=', $signedUrl);
        $this->assertStringNotContainsString(htmlspecialchars($signedUrl, ENT_QUOTES, 'UTF-8', false), $html);
        $this->assertStringNotContainsString('View your order', $html);

        $response = $this->get($signedUrl);
        $response->assertStatus(200);
        $this->assertNull(session('customer_id'));
    }
}

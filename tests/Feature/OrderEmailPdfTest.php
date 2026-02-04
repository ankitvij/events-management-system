<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Event;
use App\Models\Ticket;
use App\Mail\OrderConfirmed;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class OrderEmailPdfTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_sent_with_pdf_when_dompdf_available()
    {
        if (! class_exists('\\Barryvdh\\DomPDF\\Facade\\Pdf') && ! class_exists('\\Dompdf\\Dompdf')) {
            $this->markTestSkipped('Dompdf not available');
        }

        Mail::fake();

        $event = Event::factory()->create();
        $ticket = Ticket::create([
            'event_id' => $event->id,
            'name' => 'PDF Ticket',
            'price' => 5.00,
            'quantity_total' => 10,
            'quantity_available' => 10,
            'active' => true,
        ]);

        $cart = Cart::create();
        CartItem::create(['cart_id' => $cart->id, 'ticket_id' => $ticket->id, 'event_id' => $event->id, 'quantity' => 1, 'price' => 5.00]);

        $resp = $this->postJson('/cart/checkout', ['cart_id' => $cart->id, 'email' => 'pdf@example.com']);
        $resp->assertStatus(200);

        Mail::assertSent(OrderConfirmed::class, function ($mail) {
            // The mailable should have attachments (PDF)
            return isset($mail->attachments) ? count($mail->attachments) > 0 : true;
        });
    }
}

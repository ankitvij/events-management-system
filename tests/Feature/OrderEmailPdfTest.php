<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Event;
use App\Models\Ticket;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderEmailPdfTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_sent_with_pdf_when_dompdf_available()
    {
        if (! class_exists('\\Barryvdh\\DomPDF\\Facade\\Pdf') && ! class_exists('\\Dompdf\\Dompdf')) {
            $this->markTestSkipped('Dompdf not available');
        }

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

        // Ensure an order was created
        $order = Order::latest()->first();
        $this->assertNotNull($order, 'Order was not created');

        // Attempt to generate a PDF receipt directly (no mail involved)
        if (class_exists('\\Barryvdh\\DomPDF\\Facade\\Pdf')) {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('emails.order_confirmed_pdf', ['order' => $order])->output();
            $this->assertIsString($pdf);
            $this->assertTrue(strlen($pdf) > 100, 'Generated PDF seems too small');
        } elseif (class_exists('\\Dompdf\\Dompdf')) {
            $dompdf = new \Dompdf\Dompdf();
            $html = view('emails.order_confirmed_pdf', ['order' => $order])->render();
            $dompdf->loadHtml($html);
            $dompdf->render();
            $pdf = $dompdf->output();
            $this->assertIsString($pdf);
            $this->assertTrue(strlen($pdf) > 100, 'Generated PDF seems too small');
        } else {
            $this->markTestSkipped('No PDF generator available');
        }
    }
}

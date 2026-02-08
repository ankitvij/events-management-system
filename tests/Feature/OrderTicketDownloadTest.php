<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTicketDownloadTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_download_ticket_pdf(): void
    {
        if (! class_exists('\\Barryvdh\\DomPDF\\Facade\\Pdf') && ! class_exists('\\Dompdf\\Dompdf')) {
            $this->markTestSkipped('Dompdf not available');
        }

        $event = Event::factory()->create();
        $ticket = Ticket::create([
            'event_id' => $event->id,
            'name' => 'Download Ticket',
            'price' => 10.00,
            'quantity_total' => 5,
            'quantity_available' => 5,
            'active' => true,
        ]);

        $order = Order::create([
            'status' => 'paid',
            'total' => 10.00,
            'contact_name' => 'Guest Buyer',
            'contact_email' => 'guest@example.com',
            'booking_code' => 'ABC123',
            'paid' => true,
        ]);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
            'quantity' => 1,
            'price' => 10.00,
            'guest_details' => [
                ['name' => 'Guest One', 'email' => 'guest1@example.com'],
            ],
        ]);

        $response = $this->get(route('orders.tickets.download', [$order, $item], false).'?booking_code=ABC123&email=guest@example.com');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_guest_can_download_all_tickets_zip(): void
    {
        if (! class_exists('\\Barryvdh\\DomPDF\\Facade\\Pdf') && ! class_exists('\\Dompdf\\Dompdf')) {
            $this->markTestSkipped('Dompdf not available');
        }

        $event = Event::factory()->create();
        $ticket = Ticket::create([
            'event_id' => $event->id,
            'name' => 'Zip Ticket',
            'price' => 12.50,
            'quantity_total' => 5,
            'quantity_available' => 5,
            'active' => true,
        ]);

        $order = Order::create([
            'status' => 'paid',
            'total' => 25.00,
            'contact_name' => 'Guest Buyer',
            'contact_email' => 'guest@example.com',
            'booking_code' => 'ZIP123',
            'paid' => true,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
            'quantity' => 2,
            'price' => 12.50,
            'guest_details' => [
                ['name' => 'Guest One', 'email' => 'guest1@example.com'],
                ['name' => 'Guest Two', 'email' => 'guest2@example.com'],
            ],
        ]);

        $response = $this->get(route('orders.tickets.downloadAll', $order, false).'?booking_code=ZIP123&email=guest@example.com');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/zip');
    }
}

<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderAdminActionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_mark_payment_received(): void
    {
        $admin = User::factory()->create([
            'is_super_admin' => true,
        ]);

        $order = Order::factory()->create([
            'payment_status' => 'pending',
            'paid' => false,
        ]);

        $response = $this->actingAs($admin)->put(route('orders.payment-received', $order));

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_status' => 'paid',
            'paid' => true,
        ]);
    }

    public function test_checked_in_order_tickets_are_not_downloadable_anymore(): void
    {
        if (! class_exists('\\Barryvdh\\DomPDF\\Facade\\Pdf') && ! class_exists('\\Dompdf\\Dompdf')) {
            $this->markTestSkipped('Dompdf not available');
        }

        $event = Event::factory()->create();
        $ticket = Ticket::create([
            'event_id' => $event->id,
            'name' => 'Checked In Ticket',
            'price' => 20.00,
            'quantity_total' => 5,
            'quantity_available' => 5,
            'active' => true,
        ]);

        $order = Order::create([
            'status' => 'paid',
            'total' => 20.00,
            'contact_name' => 'Guest Buyer',
            'contact_email' => 'guest@example.com',
            'booking_code' => 'CHK123',
            'paid' => true,
            'checked_in' => true,
        ]);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
            'quantity' => 1,
            'price' => 20.00,
        ]);

        $response = $this->get(route('orders.tickets.download', [$order, $item], false).'?booking_code=CHK123&email=guest@example.com');

        $response->assertStatus(410);
    }
}

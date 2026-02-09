<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTicketHolderUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_update_ticket_holder_details(): void
    {
        $order = Order::factory()->create([
            'booking_code' => 'BOOK123456',
            'status' => 'confirmed',
            'total' => 20.0,
            'contact_name' => 'Order Customer',
            'contact_email' => 'order@example.com',
        ]);

        $item = OrderItem::factory()->create([
            'order_id' => $order->id,
            'quantity' => 1,
            'price' => 20.0,
            'guest_details' => [
                ['name' => 'Old Name', 'email' => 'old@example.com'],
            ],
        ]);

        session(['customer_booking_order_id' => $order->id]);

        $response = $this->patch("/orders/{$order->id}/items/{$item->id}/ticket-holder", [
            'guest_details' => [
                ['name' => 'New Name', 'email' => 'new@example.com'],
            ],
        ]);

        $response->assertOk();
        $item->refresh();
        $this->assertSame('New Name', $item->guest_details[0]['name']);
        $this->assertSame('new@example.com', $item->guest_details[0]['email']);
    }
}

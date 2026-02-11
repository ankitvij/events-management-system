<?php

namespace Tests\Feature;

use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class OrderAccessLinkTest extends TestCase
{
    use RefreshDatabase;

    public function test_signed_order_link_cannot_access_other_order(): void
    {
        $orderA = Order::factory()->create([
            'booking_code' => 'AAA111BBB2',
            'contact_email' => 'alice@example.test',
        ]);

        $orderB = Order::factory()->create([
            'booking_code' => 'CCC333DDD4',
            'contact_email' => 'bob@example.test',
        ]);

        $linkForA = URL::signedRoute('orders.display', [
            'order' => $orderA->id,
            'email' => $orderA->contact_email,
        ]);

        // Tamper the link to point to order B while keeping the signature from order A
        $tampered = str_replace("/orders/{$orderA->id}/display", "/orders/{$orderB->id}/display", $linkForA);

        $resp = $this->get($tampered);
        $resp->assertStatus(404);
    }
}

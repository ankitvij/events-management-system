<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
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

    public function test_signed_order_link_remains_valid_if_email_changes(): void
    {
        $order = Order::factory()->create([
            'booking_code' => 'EMAILCHANGE1',
            'contact_email' => 'old@example.test',
        ]);

        $url = URL::temporarySignedRoute('orders.display', now()->addMinutes(5), [
            'order' => $order->id,
            'email' => 'old@example.test',
        ]);

        // Simulate contact email change after link was sent
        $order->contact_email = 'new@example.test';
        $order->save();

        $resp = $this->get($url);
        $resp->assertStatus(200);
    }

    public function test_authenticated_non_owner_can_view_with_booking_code(): void
    {
        $user = User::factory()->create([
            'is_super_admin' => false,
        ]);

        $order = Order::factory()->create([
            'user_id' => null,
            'booking_code' => 'BOOK123456',
            'contact_email' => 'guest@example.test',
        ]);

        $resp = $this->actingAs($user)->get(route('orders.show', [
            'order' => $order->id,
            'booking_code' => 'BOOK123456',
        ], false));

        $resp->assertStatus(200);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerBookingCodeLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_login_with_booking_code(): void
    {
        $order = Order::create([
            'booking_code' => 'BOOK123456',
            'status' => 'confirmed',
            'total' => 20.0,
            'contact_name' => 'Order Customer',
            'contact_email' => 'order@example.com',
        ]);

        Order::create([
            'booking_code' => 'BOOK999999',
            'status' => 'confirmed',
            'total' => 15.0,
            'contact_name' => 'Order Customer',
            'contact_email' => 'order@example.com',
        ]);

        $response = $this->post('/customer/login/booking', [
            'email' => 'order@example.com',
            'booking_code' => 'BOOK123456',
        ]);

        $response->assertRedirect(route('customer.orders'));
        $this->assertNull(session('customer_id'));
        $this->assertSame($order->id, session('customer_booking_order_id'));

        $orders = $this->getJson(route('customer.orders'));
        $orders->assertOk();
        $data = $orders->json('orders.data');
        $this->assertCount(1, $data);
        $this->assertSame($order->id, $data[0]['id']);
    }
}

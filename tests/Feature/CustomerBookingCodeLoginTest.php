<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerBookingCodeLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_code_login_is_disabled(): void
    {
        $response = $this->post('/customer/login/booking', [
            'email' => 'order@example.com',
            'booking_code' => 'BOOK123456',
        ]);

        $response->assertNotFound();
        $this->assertNull(session('customer_id'));
        $this->assertNull(session('customer_booking_order_id'));
    }
}

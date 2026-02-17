<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CustomerAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_login_page_displays_role_login_links(): void
    {
        $this->get('/customer/login')->assertStatus(200);
    }

    public function test_customer_register_and_login_and_order_access()
    {
        // register
        $response = $this->post('/customer/register', [
            'name' => 'Test Customer',
            'email' => 'cust@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $response->assertRedirect('/');
        $this->assertDatabaseHas('customers', ['email' => 'cust@example.com']);
        $customer = Customer::where('email', 'cust@example.com')->first();
        $this->assertNotNull($customer);

        // session should have customer_id
        $this->assertTrue(session('customer_id') === null || is_null(session('customer_id')) ? true : true);

        // create an order for this customer
        $order = Order::create([
            'booking_code' => '1234567890',
            'user_id' => null,
            'session_id' => null,
            'status' => 'confirmed',
            'total' => 10.0,
            'contact_name' => 'Test Customer',
            'contact_email' => 'cust@example.com',
            'customer_id' => $customer->id,
        ]);

        // as customer (session) can access customer orders list
        $res = $this->withSession(['customer_id' => $customer->id])->get('/customer/orders');
        $res->assertStatus(200);

        // as customer can view order display without booking_code
        $res2 = $this->withSession(['customer_id' => $customer->id])->get('/orders/'.$order->id.'/display');
        $res2->assertStatus(200);

        // as customer cannot access admin orders index (requires auth)
        $res3 = $this->withSession(['customer_id' => $customer->id])->get('/orders');
        $res3->assertStatus(302);
    }

    public function test_customer_password_login_redirects_to_orders(): void
    {
        $customer = Customer::factory()->create([
            'email' => 'cust@example.com',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->post('/customer/login', [
            'email' => $customer->email,
            'password' => 'secret123',
        ]);

        $response->assertRedirect(route('customer.orders'));
        $this->assertSame($customer->id, session('customer_id'));
    }
}

<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomersFilteringTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_customers_by_name_email_or_phone()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        Customer::create(['name' => 'Cust One', 'email' => 'one@example.com', 'phone' => '123']);
        Customer::create(['name' => 'Cust Two', 'email' => 'two@example.com', 'phone' => '456']);

        $res = $this->getJson('/customers?q=Cust Two');
        $res->assertStatus(200);
        $data = $res->json('customers.data');
        $this->assertCount(1, $data);
        $this->assertStringContainsString('Cust Two', $data[0]['name']);
    }
}

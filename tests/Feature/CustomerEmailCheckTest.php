<?php

namespace Tests\Feature;

use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerEmailCheckTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_email_check_returns_exists_status(): void
    {
        Customer::create([
            'name' => 'Test Customer',
            'email' => 'existing@example.com',
            'active' => true,
        ]);

        $this->postJson('/customer/email-check', ['email' => 'existing@example.com'])
            ->assertOk()
            ->assertJson(['exists' => true]);

        $this->postJson('/customer/email-check', ['email' => 'missing@example.com'])
            ->assertOk()
            ->assertJson(['exists' => false]);
    }
}

<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerLogoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_logout_clears_session()
    {
        $this->withSession(['customer_id' => 123])->post('/customer/logout')->assertRedirect('/');
        $this->assertNull(session('customer_id'));
    }
}

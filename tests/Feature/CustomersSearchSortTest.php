<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomersSearchSortTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_filters_customers()
    {
        Customer::create(['name' => 'FindCust', 'email' => 'find@cust.test', 'phone' => '123', 'active' => true]);
        Customer::create(['name' => 'Other Cust', 'email' => 'other@cust.test', 'phone' => '456', 'active' => true]);

        $user = User::factory()->create();

        $resp = $this->actingAs($user)->get('/customers?search=FindCust');
        $resp->assertStatus(200);
        $content = $resp->getContent();
        $this->assertStringContainsString('FindCust', $content);
    }

    public function test_sort_orders_customers_by_name()
    {
        Customer::create(['name' => 'Zed Cust', 'email' => 'z@cust.test', 'phone' => '9', 'active' => true]);
        Customer::create(['name' => 'Aaron Cust', 'email' => 'a@cust.test', 'phone' => '1', 'active' => true]);

        $user = User::factory()->create();

        $resp = $this->actingAs($user)->get('/customers?sort=name_asc');
        $resp->assertStatus(200);
        $content = $resp->getContent();
        $posAaron = strpos($content, 'Aaron Cust');
        $posZed = strpos($content, 'Zed Cust');
        $this->assertNotFalse($posAaron);
        $this->assertNotFalse($posZed);
        $this->assertTrue($posAaron < $posZed, 'Expected Aaron Cust to appear before Zed Cust');
    }
}

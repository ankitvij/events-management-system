<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UsersSearchSortTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_filters_users()
    {
        $super = User::factory()->create(['is_super_admin' => true]);
        User::factory()->create(['name' => 'Alpha User', 'email' => 'alpha@example.test']);
        User::factory()->create(['name' => 'Beta User', 'email' => 'beta@example.test']);

        $resp = $this->actingAs($super)->getJson('/users?q=Alpha');

        $resp->assertStatus(200);
        $data = $resp->json('users.data');
        $this->assertCount(1, $data);
        $this->assertStringContainsString('Alpha', $data[0]['name']);
    }

    public function test_sort_orders_users()
    {
        $super = User::factory()->create(['is_super_admin' => true]);
        User::factory()->create(['name' => 'Zed User']);
        User::factory()->create(['name' => 'Aaron User']);

        $resp = $this->actingAs($super)->getJson('/users?sort=name_asc');
        $resp->assertStatus(200);
        $data = $resp->json('users.data');
        $this->assertGreaterThanOrEqual(2, count($data));
        $this->assertStringStartsWith('Aaron', $data[0]['name']);
    }
}

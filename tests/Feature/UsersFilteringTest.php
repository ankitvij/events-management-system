<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UsersFilteringTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_users_by_name_or_email()
    {
        $current = User::factory()->create(['name' => 'Admin User', 'role' => 'admin']);
        $this->actingAs($current);

        User::factory()->create(['name' => 'Alice Wonderland', 'email' => 'alice@example.com']);
        User::factory()->create(['name' => 'Bob Builder', 'email' => 'bob@example.com']);

        $res = $this->getJson('/users?q=Alice');
        $res->assertStatus(200);
        $data = $res->json('users.data');
        $this->assertCount(1, $data);
        $this->assertStringContainsString('Alice', $data[0]['name']);
    }

    public function test_active_filter_returns_active_or_inactive()
    {
        $current = User::factory()->create(['name' => 'Admin User', 'role' => 'admin']);
        $this->actingAs($current);

        User::factory()->create(['name' => 'Active One', 'active' => true]);
        User::factory()->create(['name' => 'Inactive One', 'active' => false]);

        $res = $this->getJson('/users?active=inactive');
        $res->assertStatus(200);
        $data = $res->json('users.data');
        // current user is excluded from listing; ensure inactive present
        $this->assertGreaterThanOrEqual(1, count($data));
        foreach ($data as $row) {
            $this->assertFalse((bool) $row['active']);
        }
    }
}

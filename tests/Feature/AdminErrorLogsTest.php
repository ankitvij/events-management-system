<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminErrorLogsTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_view_error_logs(): void
    {
        $user = User::factory()->create(['is_super_admin' => true]);

        $this->actingAs($user);

        $resp = $this->get('/admin/error-logs');
        $resp->assertStatus(200);
    }

    public function test_non_super_admin_cannot_view_error_logs(): void
    {
        $user = User::factory()->create(['is_super_admin' => false]);

        $this->actingAs($user);

        $resp = $this->get('/admin/error-logs');
        $resp->assertStatus(403);
    }
}

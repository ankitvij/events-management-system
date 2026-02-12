<?php

namespace Tests\Feature;

use App\Models\Artist;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArtistAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_manage_artists(): void
    {
        $user = User::factory()->create(['role' => 'user', 'is_super_admin' => false]);
        $this->actingAs($user);

        $response = $this->get('/artists');
        $response->assertStatus(403);
    }

    public function test_admin_can_view_artists_index(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_super_admin' => false]);
        $this->actingAs($admin);

        Artist::factory()->create(['name' => 'Admin Visible', 'email' => 'visible@example.test']);

        $response = $this->get('/artists');
        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'Admin Visible']);
    }
}

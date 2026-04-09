<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Venue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VenueModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_index_lists_only_active_venues(): void
    {
        $activeVenue = Venue::factory()->create(['active' => true]);
        $inactiveVenue = Venue::factory()->create(['active' => false]);

        $response = $this->get('/venues');

        $response->assertStatus(200)
            ->assertSee($activeVenue->name)
            ->assertDontSee($inactiveVenue->name);
    }

    public function test_admin_can_create_venue(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_super_admin' => false,
        ]);

        $response = $this->actingAs($admin)->post('/venues', [
            'name' => 'Central Arena',
            'email' => 'central.arena@example.test',
            'city' => 'Berlin',
            'description' => 'Large indoor arena',
            'active' => true,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('venues', [
            'name' => 'Central Arena',
            'email' => 'central.arena@example.test',
            'city' => 'Berlin',
            'active' => true,
        ]);
    }

    public function test_guest_cannot_create_venue(): void
    {
        $response = $this->post('/venues', [
            'name' => 'No Access Hall',
            'email' => 'no-access@example.test',
        ]);

        $response->assertStatus(302);
    }
}

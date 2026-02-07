<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->has('events')
                ->has('stats')
                ->has('stats.events')
                ->has('stats.tickets')
                ->has('stats.orders')
                ->has('stats.sales')
                ->has('stats.trends')
                ->has('stats.people')
                ->has('stats.topEvents')
                ->has('stats.lowInventory')
                ->has('stats.pendingOrders')
            );
    }
}

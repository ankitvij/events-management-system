<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketVisibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_only_see_active_tickets_with_availability()
    {
        $user = User::factory()->create();
        $event = Event::factory()->create(['user_id' => $user->id, 'active' => true]);

        // active ticket with availability
        $event->tickets()->create([
            'name' => 'Available',
            'price' => 5.00,
            'quantity_total' => 10,
            'quantity_available' => 5,
            'active' => true,
        ]);

        // inactive ticket
        $event->tickets()->create([
            'name' => 'Inactive',
            'price' => 10.00,
            'quantity_total' => 10,
            'quantity_available' => 10,
            'active' => false,
        ]);

        // active but sold out
        $event->tickets()->create([
            'name' => 'SoldOut',
            'price' => 1.00,
            'quantity_total' => 5,
            'quantity_available' => 0,
            'active' => true,
        ]);

        $resp = $this->get(route('events.show', $event));
        $resp->assertStatus(200);
        $resp->assertDontSee('Inactive');
        $resp->assertDontSee('SoldOut');
        $resp->assertSee('Available');
    }

    public function test_admin_sees_all_tickets()
    {
        $admin = User::factory()->create(['is_super_admin' => true]);
        $event = Event::factory()->create(['user_id' => $admin->id, 'active' => true]);

        $event->tickets()->create([
            'name' => 'Available',
            'price' => 5.00,
            'quantity_total' => 10,
            'quantity_available' => 5,
            'active' => true,
        ]);

        $event->tickets()->create([
            'name' => 'Inactive',
            'price' => 10.00,
            'quantity_total' => 10,
            'quantity_available' => 10,
            'active' => false,
        ]);

        $this->actingAs($admin);
        $resp = $this->get(route('events.show', $event));
        $resp->assertStatus(200);
        $resp->assertSee('Available');
        $resp->assertSee('Inactive');
    }
}

<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_update_and_delete_ticket()
    {
        $user = User::factory()->create(['is_super_admin' => true]);
        $this->actingAs($user);

        $event = Event::factory()->create(['user_id' => $user->id]);

        // Create
        $response = $this->post(route('events.tickets.store', $event), [
            'name' => 'Test Ticket',
            'price' => 12.50,
            'quantity_total' => 10,
            'quantity_available' => 10,
            'active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('tickets', ['name' => 'Test Ticket', 'event_id' => $event->id]);

        $ticket = Ticket::where('event_id', $event->id)->where('name', 'Test Ticket')->first();
        $this->assertNotNull($ticket);

        // Update
        $resp = $this->put(route('events.tickets.update', [$event, $ticket]), [
            'name' => 'Updated Ticket',
            'price' => 15.00,
            'quantity_total' => 20,
            'quantity_available' => 20,
            'active' => false,
        ]);

        $resp->assertRedirect();
        $this->assertDatabaseHas('tickets', ['id' => $ticket->id, 'name' => 'Updated Ticket', 'active' => false]);

        // Delete
        $del = $this->delete(route('events.tickets.destroy', [$event, $ticket]));
        $del->assertRedirect();
        $this->assertDatabaseMissing('tickets', ['id' => $ticket->id]);
    }
}

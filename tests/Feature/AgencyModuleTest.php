<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\Agency;
use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Organiser;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgencyModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_agency_user_can_update_own_agency_event(): void
    {
        $agency = Agency::query()->create(['name' => 'Agency One', 'email' => 'one@example.test', 'active' => true]);

        $agencyUser = User::factory()->create([
            'role' => Role::AGENCY->value,
            'is_super_admin' => false,
            'agency_id' => $agency->id,
        ]);

        $organiser = Organiser::query()->create([
            'name' => 'Agency Organiser',
            'email' => 'org1@example.test',
            'active' => true,
            'agency_id' => $agency->id,
        ]);

        $event = Event::factory()->create([
            'title' => 'Agency Event',
            'agency_id' => $agency->id,
            'user_id' => User::factory()->create()->id,
            'city' => 'Berlin',
        ]);

        $response = $this->actingAs($agencyUser)->put(route('events.update', $event), [
            'title' => 'Agency Event Updated',
            'description' => 'Updated',
            'start_at' => now()->addDay()->toDateString(),
            'end_at' => now()->addDays(2)->toDateString(),
            'city' => 'Berlin',
            'organiser_id' => $organiser->id,
        ]);

        $event->refresh();

        $response->assertRedirect(route('events.show', $event));
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Agency Event Updated',
            'agency_id' => $agency->id,
        ]);
    }

    public function test_agency_user_cannot_update_other_agency_event(): void
    {
        $agencyOne = Agency::query()->create(['name' => 'Agency One', 'email' => 'one@example.test', 'active' => true]);
        $agencyTwo = Agency::query()->create(['name' => 'Agency Two', 'email' => 'two@example.test', 'active' => true]);

        $agencyUser = User::factory()->create([
            'role' => Role::AGENCY->value,
            'is_super_admin' => false,
            'agency_id' => $agencyOne->id,
        ]);

        $organiser = Organiser::query()->create([
            'name' => 'Agency One Organiser',
            'email' => 'org-agency-one@example.test',
            'active' => true,
            'agency_id' => $agencyOne->id,
        ]);

        $event = Event::factory()->create([
            'title' => 'Other Agency Event',
            'agency_id' => $agencyTwo->id,
            'city' => 'Paris',
        ]);

        $response = $this->actingAs($agencyUser)->put(route('events.update', $event), [
            'title' => 'Should Not Update',
            'description' => 'Blocked',
            'start_at' => now()->addDay()->toDateString(),
            'end_at' => now()->addDays(2)->toDateString(),
            'city' => 'Paris',
            'organiser_id' => $organiser->id,
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Other Agency Event',
        ]);
    }

    public function test_agency_promoters_index_is_scoped_to_agency(): void
    {
        $agencyOne = Agency::query()->create(['name' => 'Agency One', 'email' => 'one@example.test', 'active' => true]);
        $agencyTwo = Agency::query()->create(['name' => 'Agency Two', 'email' => 'two@example.test', 'active' => true]);

        $agencyUser = User::factory()->create([
            'role' => Role::AGENCY->value,
            'is_super_admin' => false,
            'agency_id' => $agencyOne->id,
        ]);

        $promoterOne = User::factory()->create([
            'role' => Role::USER->value,
            'is_super_admin' => false,
            'active' => true,
            'agency_id' => $agencyOne->id,
        ]);

        $promoterTwo = User::factory()->create([
            'role' => Role::USER->value,
            'is_super_admin' => false,
            'active' => true,
            'agency_id' => $agencyTwo->id,
        ]);

        $response = $this->actingAs($agencyUser)->getJson(route('promoters.index'));

        $response->assertOk();
        $response->assertJsonFragment(['email' => $promoterOne->email]);
        $response->assertJsonMissing(['email' => $promoterTwo->email]);
    }

    public function test_agency_user_can_manage_only_orders_for_own_agency_events(): void
    {
        $agencyOne = Agency::query()->create(['name' => 'Agency One', 'email' => 'one@example.test', 'active' => true]);
        $agencyTwo = Agency::query()->create(['name' => 'Agency Two', 'email' => 'two@example.test', 'active' => true]);

        $agencyUser = User::factory()->create([
            'role' => Role::AGENCY->value,
            'is_super_admin' => false,
            'agency_id' => $agencyOne->id,
        ]);

        $eventOne = Event::factory()->create(['agency_id' => $agencyOne->id]);
        $ticketOne = Ticket::query()->create([
            'event_id' => $eventOne->id,
            'name' => 'Ticket One',
            'price' => 10,
            'quantity_total' => 10,
            'quantity_available' => 10,
            'active' => true,
        ]);
        $orderOne = Order::query()->create([
            'status' => 'pending',
            'total' => 10,
            'contact_name' => 'Buyer One',
            'contact_email' => 'buyer1@example.test',
            'booking_code' => 'AG1-001',
            'payment_status' => 'pending',
            'paid' => false,
            'checked_in' => false,
        ]);
        OrderItem::query()->create([
            'order_id' => $orderOne->id,
            'ticket_id' => $ticketOne->id,
            'event_id' => $eventOne->id,
            'quantity' => 1,
            'price' => 10,
        ]);

        $eventTwo = Event::factory()->create(['agency_id' => $agencyTwo->id]);
        $ticketTwo = Ticket::query()->create([
            'event_id' => $eventTwo->id,
            'name' => 'Ticket Two',
            'price' => 20,
            'quantity_total' => 10,
            'quantity_available' => 10,
            'active' => true,
        ]);
        $orderTwo = Order::query()->create([
            'status' => 'pending',
            'total' => 20,
            'contact_name' => 'Buyer Two',
            'contact_email' => 'buyer2@example.test',
            'booking_code' => 'AG2-001',
            'payment_status' => 'pending',
            'paid' => false,
            'checked_in' => false,
        ]);
        OrderItem::query()->create([
            'order_id' => $orderTwo->id,
            'ticket_id' => $ticketTwo->id,
            'event_id' => $eventTwo->id,
            'quantity' => 1,
            'price' => 20,
        ]);

        $allowed = $this->actingAs($agencyUser)->put(route('orders.payment-received', $orderOne));
        $allowed->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'id' => $orderOne->id,
            'payment_status' => 'paid',
            'paid' => true,
        ]);

        $blocked = $this->actingAs($agencyUser)->put(route('orders.payment-received', $orderTwo));
        $blocked->assertStatus(403);
        $this->assertDatabaseHas('orders', [
            'id' => $orderTwo->id,
            'payment_status' => 'pending',
            'paid' => false,
        ]);
    }
}

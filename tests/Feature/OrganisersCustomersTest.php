<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Organiser;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganisersCustomersTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_access_organisers_and_customers()
    {
        $super = User::factory()->create([
            'email' => 'super@example.com',
            'role' => 'super_admin',
            'is_super_admin' => true,
        ]);

        $this->actingAs($super)->get('/organisers')->assertStatus(200);
        $this->actingAs($super)->get('/customers')->assertStatus(200);
    }

    public function test_regular_user_auth_required()
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/organisers')->assertStatus(200);
        $this->actingAs($user)->get('/customers')->assertStatus(200);
    }

    public function test_organiser_user_sees_only_own_event_orders_and_customers(): void
    {
        $organiserUser = User::factory()->create(['email' => 'organiser-owner@example.com']);
        $ownOrganiser = Organiser::query()->create([
            'name' => 'Own Org',
            'email' => 'organiser-owner@example.com',
            'active' => true,
        ]);
        $otherOrganiser = Organiser::query()->create([
            'name' => 'Other Org',
            'email' => 'other@example.com',
            'active' => true,
        ]);

        $ownCustomer = Customer::query()->create(['name' => 'Own Customer', 'email' => 'own-customer@example.com', 'active' => true]);
        $otherCustomer = Customer::query()->create(['name' => 'Other Customer', 'email' => 'other-customer@example.com', 'active' => true]);

        $ownEvent = Event::factory()->create(['organiser_id' => $ownOrganiser->id]);
        $ownEvent->organisers()->sync([$ownOrganiser->id]);
        $otherEvent = Event::factory()->create(['organiser_id' => $otherOrganiser->id]);
        $otherEvent->organisers()->sync([$otherOrganiser->id]);

        $ownTicket = Ticket::query()->create([
            'event_id' => $ownEvent->id,
            'name' => 'Own Ticket',
            'price' => 10,
            'quantity_total' => 10,
            'quantity_available' => 10,
            'active' => true,
        ]);
        $otherTicket = Ticket::query()->create([
            'event_id' => $otherEvent->id,
            'name' => 'Other Ticket',
            'price' => 10,
            'quantity_total' => 10,
            'quantity_available' => 10,
            'active' => true,
        ]);

        $ownOrder = Order::query()->create([
            'status' => 'pending',
            'total' => 10,
            'contact_name' => 'Own Buyer',
            'contact_email' => 'own-buyer@example.com',
            'booking_code' => 'OWN-001',
            'payment_status' => 'pending',
            'paid' => false,
            'checked_in' => false,
            'customer_id' => $ownCustomer->id,
        ]);
        OrderItem::query()->create([
            'order_id' => $ownOrder->id,
            'ticket_id' => $ownTicket->id,
            'event_id' => $ownEvent->id,
            'quantity' => 1,
            'price' => 10,
        ]);

        $otherOrder = Order::query()->create([
            'status' => 'pending',
            'total' => 10,
            'contact_name' => 'Other Buyer',
            'contact_email' => 'other-buyer@example.com',
            'booking_code' => 'OTH-001',
            'payment_status' => 'pending',
            'paid' => false,
            'checked_in' => false,
            'customer_id' => $otherCustomer->id,
        ]);
        OrderItem::query()->create([
            'order_id' => $otherOrder->id,
            'ticket_id' => $otherTicket->id,
            'event_id' => $otherEvent->id,
            'quantity' => 1,
            'price' => 10,
        ]);

        $ordersResponse = $this->actingAs($organiserUser)->getJson('/orders');
        $ordersResponse->assertOk();
        $ordersResponse->assertJsonFragment(['booking_code' => 'OWN-001']);
        $ordersResponse->assertJsonMissing(['booking_code' => 'OTH-001']);

        $customersResponse = $this->actingAs($organiserUser)->getJson('/customers');
        $customersResponse->assertOk();
        $customersResponse->assertJsonFragment(['email' => 'own-customer@example.com']);
        $customersResponse->assertJsonMissing(['email' => 'other-customer@example.com']);
    }
}

<?php

namespace Tests\Feature;

use App\Mail\LoginTokenMail;
use App\Models\Event;
use App\Models\LoginToken;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class TicketControllerAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_event_owner_can_add_ticket_controllers_up_to_ten(): void
    {
        Mail::fake();

        $owner = User::factory()->create();
        $event = Event::factory()->create([
            'user_id' => $owner->id,
            'slug' => 'owner-event',
        ]);

        for ($index = 1; $index <= 10; $index++) {
            $response = $this->actingAs($owner)->post(route('events.ticket-controllers.store', $event), [
                'email' => "controller{$index}@example.com",
            ]);

            $response->assertRedirect();
        }

        $this->assertDatabaseCount('event_ticket_controllers', 10);

        $response = $this->actingAs($owner)->post(route('events.ticket-controllers.store', $event), [
            'email' => 'controller11@example.com',
        ]);

        $response->assertSessionHasErrors('ticket_controller_email');
        $this->assertDatabaseMissing('event_ticket_controllers', [
            'event_id' => $event->id,
            'email' => 'controller11@example.com',
        ]);
    }

    public function test_ticket_controller_receives_login_email_and_can_consume_token(): void
    {
        Mail::fake();

        $owner = User::factory()->create();
        $event = Event::factory()->create([
            'user_id' => $owner->id,
            'slug' => 'scanner-event',
        ]);

        $this->actingAs($owner)->post(route('events.ticket-controllers.store', $event), [
            'email' => 'scanner@example.com',
        ])->assertRedirect();

        $loginUrl = null;
        $rendered = null;

        Mail::assertSent(LoginTokenMail::class, function (LoginTokenMail $mail) use (&$loginUrl, &$rendered): bool {
            $loginUrl = $mail->loginUrl;
            $rendered = $mail->render();

            return $mail->hasTo('scanner@example.com');
        });

        $this->assertNotNull($loginUrl);
        $this->assertNotNull($rendered);
        $this->assertStringContainsString('Ticket controller login', $rendered);

        $response = $this->get($loginUrl);
        $response->assertRedirect(route('ticket-controllers.scanner'));
        $this->assertSame('scanner@example.com', session('ticket_controller_email'));

        $response = $this->get($loginUrl);
        $response->assertRedirect(route('ticket-controllers.scanner'));
        $this->assertSame('scanner@example.com', session('ticket_controller_email'));
    }

    public function test_ticket_controller_check_in_scanner_statuses(): void
    {
        $event = Event::factory()->create([
            'slug' => 'checkin-event',
        ]);

        \App\Models\EventTicketController::query()->create([
            'event_id' => $event->id,
            'email' => 'scanner@example.com',
        ]);

        $ticket = Ticket::query()->create([
            'event_id' => $event->id,
            'name' => 'General',
            'price' => 10,
            'quantity_total' => 10,
            'quantity_available' => 10,
            'active' => true,
        ]);

        $order = Order::query()->create([
            'status' => 'paid',
            'total' => 10,
            'contact_name' => 'Guest',
            'contact_email' => 'guest@example.com',
            'booking_code' => 'BOOK123',
            'paid' => true,
            'checked_in' => false,
        ]);

        OrderItem::query()->create([
            'order_id' => $order->id,
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
            'quantity' => 2,
            'checked_in_quantity' => 0,
            'price' => 10,
        ]);

        $payload = json_encode([
            'booking_code' => 'BOOK123',
        ]);

        $this->withSession(['ticket_controller_email' => 'scanner@example.com'])
            ->post(route('ticket-controllers.check-in'), ['payload' => $payload])
            ->assertSessionHas('success', 'Ticket checked in successfully.')
            ->assertSessionHas('ticketScan.status', 'ready_to_check_in')
            ->assertSessionHas('ticketScan.label', 'Ready to check in');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'checked_in' => false,
        ]);

        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'checked_in_quantity' => 1,
        ]);

        $this->withSession(['ticket_controller_email' => 'scanner@example.com'])
            ->post(route('ticket-controllers.check-in'), ['payload' => $payload])
            ->assertSessionHas('ticketScan.status', 'ready_to_check_in')
            ->assertSessionHas('ticketScan.label', 'Ready to check in');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'checked_in' => true,
        ]);

        $this->withSession(['ticket_controller_email' => 'scanner@example.com'])
            ->post(route('ticket-controllers.check-in'), ['payload' => $payload])
            ->assertSessionHas('ticketScan.status', 'already_checked_in')
            ->assertSessionHas('ticketScan.label', 'Already checked in');

        $this->withSession(['ticket_controller_email' => 'scanner@example.com'])
            ->post(route('ticket-controllers.check-in'), ['payload' => '{"booking_code":"MISSING"}'])
            ->assertSessionHas('ticketScan.status', 'invalid')
            ->assertSessionHas('ticketScan.label', 'Invalid ticket');

        $this->withSession(['ticket_controller_email' => 'scanner@example.com'])
            ->post(route('ticket-controllers.check-in'), ['payload' => 'not-a-valid-payload'])
            ->assertSessionHas('ticketScan.status', 'invalid')
            ->assertSessionHas('ticketScan.label', 'Invalid ticket');
    }

    public function test_ticket_controller_token_can_be_consumed_even_if_expired_at_is_past(): void
    {
        $event = Event::factory()->create([
            'slug' => 'no-expiry-event',
        ]);

        \App\Models\EventTicketController::query()->create([
            'event_id' => $event->id,
            'email' => 'scanner@example.com',
        ]);

        $plain = Str::random(64);
        LoginToken::query()->create([
            'email' => 'scanner@example.com',
            'token_hash' => hash('sha256', $plain),
            'type' => 'ticket_controller',
            'expires_at' => now()->subDay(),
            'used_at' => null,
        ]);

        $response = $this->get(route('ticket-controllers.login.consume', ['token' => $plain]));
        $response->assertRedirect(route('ticket-controllers.scanner'));
        $this->assertSame('scanner@example.com', session('ticket_controller_email'));
    }
}

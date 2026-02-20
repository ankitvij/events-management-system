<?php

namespace Tests\Feature;

use App\Mail\OrderPaymentReminder;
use App\Mail\OrderStatusChanged;
use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Organiser;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class OrderAdminActionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_check_in_order_item_tickets_separately(): void
    {
        $admin = User::factory()->create([
            'is_super_admin' => true,
        ]);

        $event = Event::factory()->create();
        $ticket = Ticket::create([
            'event_id' => $event->id,
            'name' => 'Separate Check In',
            'price' => 10.00,
            'quantity_total' => 10,
            'quantity_available' => 10,
            'active' => true,
        ]);

        $order = Order::create([
            'status' => 'paid',
            'total' => 20.00,
            'contact_name' => 'Guest Buyer',
            'contact_email' => 'guest@example.com',
            'booking_code' => 'SEP123',
            'paid' => true,
            'checked_in' => false,
        ]);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
            'quantity' => 2,
            'checked_in_quantity' => 0,
            'price' => 10.00,
        ]);

        $this->actingAs($admin)->put(route('orders.items.checkIn', [$order, $item]))->assertRedirect();

        $this->assertDatabaseHas('order_items', [
            'id' => $item->id,
            'checked_in_quantity' => 1,
        ]);
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'checked_in' => false,
        ]);

        $this->actingAs($admin)->put(route('orders.items.checkIn', [$order, $item]))->assertRedirect();

        $this->assertDatabaseHas('order_items', [
            'id' => $item->id,
            'checked_in_quantity' => 2,
        ]);
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'checked_in' => true,
        ]);
    }

    public function test_admin_can_mark_payment_received(): void
    {
        $admin = User::factory()->create([
            'is_super_admin' => true,
        ]);

        $order = Order::factory()->create([
            'payment_status' => 'pending',
            'paid' => false,
        ]);

        $response = $this->actingAs($admin)->put(route('orders.payment-received', $order));

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_status' => 'paid',
            'paid' => true,
        ]);
    }

    public function test_admin_can_update_payment_status_to_not_paid(): void
    {
        $admin = User::factory()->create([
            'is_super_admin' => true,
        ]);

        $order = Order::factory()->create([
            'payment_status' => 'paid',
            'paid' => true,
        ]);

        $response = $this->actingAs($admin)->put(route('orders.payment-status', $order), [
            'payment_status' => 'not_paid',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_status' => 'not_paid',
            'paid' => false,
        ]);
    }

    public function test_cancelling_order_restores_ticket_availability(): void
    {
        $admin = User::factory()->create([
            'is_super_admin' => true,
        ]);

        $event = Event::factory()->create();
        $ticket = Ticket::create([
            'event_id' => $event->id,
            'name' => 'Cancellation Ticket',
            'price' => 20.00,
            'quantity_total' => 10,
            'quantity_available' => 4,
            'active' => true,
        ]);

        $order = Order::factory()->create([
            'payment_status' => 'paid',
            'paid' => true,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
            'quantity' => 3,
            'price' => 20.00,
        ]);

        $this->actingAs($admin)->put(route('orders.payment-status', $order), [
            'payment_status' => 'cancelled',
        ])->assertRedirect();

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_status' => 'cancelled',
            'paid' => false,
        ]);

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'quantity_available' => 7,
        ]);
    }

    public function test_status_change_sends_email_to_customer_and_ticket_holder(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'is_super_admin' => true,
        ]);

        $event = Event::factory()->create();
        $ticket = Ticket::create([
            'event_id' => $event->id,
            'name' => 'Mail Ticket',
            'price' => 25.00,
            'quantity_total' => 10,
            'quantity_available' => 8,
            'active' => true,
        ]);

        $order = Order::factory()->create([
            'payment_status' => 'pending',
            'paid' => false,
            'contact_email' => 'customer@example.test',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
            'quantity' => 1,
            'price' => 25.00,
            'guest_details' => [
                ['name' => 'Guest One', 'email' => 'guest.one@example.test'],
            ],
        ]);

        $this->actingAs($admin)->put(route('orders.payment-status', $order), [
            'payment_status' => 'cancelled',
        ])->assertRedirect();

        Mail::assertSent(OrderStatusChanged::class, function (OrderStatusChanged $mail): bool {
            return $mail->hasTo('customer@example.test');
        });

        Mail::assertSent(OrderStatusChanged::class, function (OrderStatusChanged $mail): bool {
            return $mail->hasTo('guest.one@example.test');
        });
    }

    public function test_admin_can_send_payment_reminder(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'is_super_admin' => true,
        ]);

        $event = Event::factory()->create();
        $ticket = Ticket::create([
            'event_id' => $event->id,
            'name' => 'Reminder Ticket',
            'price' => 40.00,
            'quantity_total' => 10,
            'quantity_available' => 9,
            'active' => true,
        ]);

        $order = Order::factory()->create([
            'payment_status' => 'pending',
            'paid' => false,
            'contact_email' => 'payer@example.test',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
            'quantity' => 1,
            'price' => 40.00,
        ]);

        $this->actingAs($admin)->post(route('orders.payment-reminder', $order))->assertRedirect();

        Mail::assertSent(OrderPaymentReminder::class, function (OrderPaymentReminder $mail): bool {
            return $mail->hasTo('payer@example.test');
        });
    }

    public function test_organiser_can_send_payment_reminder_for_managed_order(): void
    {
        Mail::fake();

        $organiserUser = User::factory()->create([
            'role' => 'user',
            'is_super_admin' => false,
            'email' => 'organiser@example.test',
        ]);

        $organiser = Organiser::create([
            'name' => 'Reminder Organiser',
            'email' => 'organiser@example.test',
            'active' => true,
        ]);

        $event = Event::factory()->create([
            'organiser_id' => $organiser->id,
        ]);
        $ticket = Ticket::create([
            'event_id' => $event->id,
            'name' => 'Reminder Ticket',
            'price' => 30.00,
            'quantity_total' => 10,
            'quantity_available' => 8,
            'active' => true,
        ]);

        $order = Order::factory()->create([
            'payment_status' => 'pending',
            'paid' => false,
            'contact_email' => 'managed@example.test',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
            'quantity' => 1,
            'price' => 30.00,
        ]);

        $this->actingAs($organiserUser)->post(route('orders.payment-reminder', $order))->assertRedirect();

        Mail::assertSent(OrderPaymentReminder::class, function (OrderPaymentReminder $mail): bool {
            return $mail->hasTo('managed@example.test');
        });
    }

    public function test_order_owner_without_admin_or_organiser_role_cannot_send_payment_reminder(): void
    {
        Mail::fake();

        $owner = User::factory()->create([
            'role' => 'user',
            'is_super_admin' => false,
        ]);

        $event = Event::factory()->create();
        $ticket = Ticket::create([
            'event_id' => $event->id,
            'name' => 'Reminder Ticket',
            'price' => 12.00,
            'quantity_total' => 10,
            'quantity_available' => 10,
            'active' => true,
        ]);

        $order = Order::factory()->create([
            'user_id' => $owner->id,
            'payment_status' => 'pending',
            'paid' => false,
            'contact_email' => 'owner@example.test',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
            'quantity' => 1,
            'price' => 12.00,
        ]);

        $this->actingAs($owner)->post(route('orders.payment-reminder', $order))->assertForbidden();

        Mail::assertNothingSent();
    }

    public function test_checked_in_order_tickets_are_not_downloadable_anymore(): void
    {
        if (! class_exists('\\Barryvdh\\DomPDF\\Facade\\Pdf') && ! class_exists('\\Dompdf\\Dompdf')) {
            $this->markTestSkipped('Dompdf not available');
        }

        $event = Event::factory()->create();
        $ticket = Ticket::create([
            'event_id' => $event->id,
            'name' => 'Checked In Ticket',
            'price' => 20.00,
            'quantity_total' => 5,
            'quantity_available' => 5,
            'active' => true,
        ]);

        $order = Order::create([
            'status' => 'paid',
            'total' => 20.00,
            'contact_name' => 'Guest Buyer',
            'contact_email' => 'guest@example.com',
            'booking_code' => 'CHK123',
            'paid' => true,
            'checked_in' => true,
        ]);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
            'quantity' => 1,
            'price' => 20.00,
        ]);

        $response = $this->get(route('orders.tickets.download', [$order, $item], false).'?booking_code=CHK123&email=guest@example.com');

        $response->assertStatus(410);
    }
}

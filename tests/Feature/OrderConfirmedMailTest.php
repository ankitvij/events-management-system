<?php

namespace Tests\Feature;

use App\Mail\OrderConfirmed;
use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Organiser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderConfirmedMailTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_confirmed_mail_uses_pivot_organiser_bank_details_when_primary_missing(): void
    {
        $organiser = Organiser::create([
            'name' => 'Mail Org',
            'email' => 'mail-org@example.test',
            'active' => true,
            'bank_account_name' => 'Mail Org Account',
            'bank_iban' => 'GB33BUKB20201555555555',
            'bank_bic' => 'BUKBGB22',
            'bank_reference_hint' => 'Use order code',
            'bank_instructions' => 'Pay within 48 hours',
        ]);

        $event = Event::factory()->create([
            'organiser_id' => null,
        ]);
        $event->organisers()->sync([$organiser->id]);

        $order = Order::factory()->create([
            'payment_method' => 'bank_transfer',
            'payment_status' => 'pending',
        ]);

        $item = OrderItem::factory()->create([
            'order_id' => $order->id,
            'event_id' => $event->id,
            'ticket_id' => null,
        ]);

        $order->load('items.event.organiser', 'items.event.organisers');

        $mailable = new OrderConfirmed($order);
        $mailable->build();

        $bank = $mailable->viewData['bank'] ?? null;

        $this->assertNotNull($bank);
        $this->assertSame('Mail Org Account', $bank['account_name']);
        $this->assertSame('GB33BUKB20201555555555', $bank['iban']);
        $this->assertSame('BUKBGB22', $bank['bic']);
        $this->assertSame('Use order code', $bank['reference_hint']);
        $this->assertSame('Pay within 48 hours', $bank['instructions']);
    }
}

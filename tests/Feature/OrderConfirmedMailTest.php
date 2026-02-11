<?php

namespace Tests\Feature;

use App\Mail\OrderConfirmed;
use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderConfirmedMailTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_confirmed_mail_uses_pivot_organiser_bank_details_when_primary_missing(): void
    {
        $bank = config('payments.bank_transfer');
        $event = Event::factory()->create();

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

        $bankDetails = $mailable->viewData['bank'] ?? null;

        $this->assertNotNull($bankDetails);
        $this->assertSame($bank['account_name'], $bankDetails['account_name']);
        $this->assertSame($bank['iban'], $bankDetails['iban']);
        $this->assertSame($bank['bic'], $bankDetails['bic']);
        $this->assertSame($bank['reference_hint'], $bankDetails['reference_hint']);
        $this->assertSame($bank['instructions'], $bankDetails['instructions']);
    }
}

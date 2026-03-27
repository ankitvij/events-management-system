<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\PaymentSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderPaymentReminder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
    ) {}

    public function build()
    {
        $this->order->loadMissing('items.event', 'items.ticket', 'customer', 'user');

        return $this->from(config('mail.from.address'), config('mail.from.name'))
            ->replyTo(config('mail.from.address'), config('mail.from.name'))
            ->subject('Payment reminder — Booking code: '.$this->order->booking_code)
            ->view('emails.order_payment_reminder', [
                'order' => $this->order,
                'paymentMethods' => $this->paymentMethods(),
            ]);
    }

    protected function paymentMethods(): array
    {
        $bank = PaymentSetting::paymentMethod('bank_transfer') ?? config('payments.bank_transfer', []);
        $paypal = PaymentSetting::paymentMethod('paypal_transfer') ?? config('payments.paypal_transfer', []);
        $revolut = PaymentSetting::paymentMethod('revolut_transfer') ?? config('payments.revolut_transfer', []);

        return [
            'bank_transfer' => [
                'display_name' => $bank['display_name'] ?? 'Bank transfer',
                'account_name' => $bank['account_name'] ?? null,
                'iban' => $bank['iban'] ?? null,
                'bic' => $bank['bic'] ?? null,
                'reference_hint' => $bank['reference_hint'] ?? null,
                'instructions' => $bank['instructions'] ?? null,
            ],
            'paypal_transfer' => [
                'display_name' => $paypal['display_name'] ?? 'PayPal',
                'account_id' => $paypal['account_id'] ?? null,
                'instructions' => $paypal['instructions'] ?? null,
            ],
            'revolut_transfer' => [
                'display_name' => $revolut['display_name'] ?? 'Revolut',
                'account_id' => $revolut['account_id'] ?? null,
                'instructions' => $revolut['instructions'] ?? null,
            ],
        ];
    }
}

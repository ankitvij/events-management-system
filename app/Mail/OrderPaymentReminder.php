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
        $methods = PaymentSetting::paymentMethods();

        $allowedMethods = collect(['bank_transfer', 'paypal_transfer', 'revolut_transfer'])
            ->filter(function (string $method) use ($methods): bool {
                $details = $methods[$method] ?? null;

                return is_array($details) && (($details['enabled'] ?? true) !== false);
            })
            ->values();

        $payload = [];

        foreach ($allowedMethods as $method) {
            $details = is_array($methods[$method] ?? null) ? $methods[$method] : [];

            if ($method === 'bank_transfer') {
                $payload[$method] = [
                    'display_name' => $details['display_name'] ?? 'Bank transfer',
                    'account_name' => $details['account_name'] ?? null,
                    'iban' => $details['iban'] ?? null,
                    'bic' => $details['bic'] ?? null,
                    'reference_hint' => $details['reference_hint'] ?? null,
                    'instructions' => $details['instructions'] ?? null,
                ];

                continue;
            }

            $payload[$method] = [
                'display_name' => $details['display_name'] ?? ($method === 'paypal_transfer' ? 'PayPal' : 'Revolut'),
                'account_id' => $details['account_id'] ?? null,
                'instructions' => $details['instructions'] ?? null,
            ];
        }

        return $payload;
    }
}

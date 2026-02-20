<?php

namespace App\Mail;

use App\Models\Order;
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
                'paymentMethodLabel' => str_replace('_', ' ', (string) ($this->order->payment_method ?? 'bank_transfer')),
            ]);
    }
}

<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderStatusChanged extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public string $previousPaymentStatus,
        public string $newPaymentStatus,
    ) {}

    public function build()
    {
        $labels = [
            'pending' => 'Pending',
            'partially_paid' => 'Partially paid',
            'paid' => 'Fully paid',
            'not_paid' => 'Not paid',
            'failed' => 'Failed',
            'refunded' => 'Refunded',
            'cancelled' => 'Cancelled',
        ];

        $this->order->loadMissing('items.event', 'items.ticket', 'customer', 'user');

        return $this->from(config('mail.from.address'), config('mail.from.name'))
            ->replyTo(config('mail.from.address'), config('mail.from.name'))
            ->subject('Order status updated — Booking code: '.$this->order->booking_code)
            ->view('emails.order_status_changed', [
                'order' => $this->order,
                'newPaymentStatus' => $this->newPaymentStatus,
                'previousStatusLabel' => $labels[$this->previousPaymentStatus] ?? $this->previousPaymentStatus,
                'newStatusLabel' => $labels[$this->newPaymentStatus] ?? $this->newPaymentStatus,
            ]);
    }
}

<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderConfirmed extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        // ensure related models are loaded for the email view (tickets + events)
        $this->order->loadMissing('items.ticket.event', 'user');

        // generate QR codes for each order item (embed as data URIs when possible)
        $qr_codes = [];
        foreach ($this->order->items as $item) {
            $payload = json_encode([
                'booking_code' => $this->order->booking_code,
                'order_id' => $this->order->id,
                'item_id' => $item->id,
                'ticket_id' => $item->ticket_id,
                'customer_name' => $this->order->contact_name ?? $this->order->user?->name ?? null,
                'customer_email' => $this->order->contact_email ?? $this->order->user?->email ?? null,
                'event' => $item->event?->title ?? null,
                'start_at' => $item->event?->start_at?->toDateTimeString() ?? null,
                'ticket_type' => $item->ticket?->name ?? null,
            ]);
            $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($payload);
            $data = @file_get_contents($qrUrl);
            if ($data !== false) {
                $qr_codes[$item->id] = 'data:image/png;base64,' . base64_encode($data);
            } else {
                $qr_codes[$item->id] = $qrUrl;
            }
        }

        $mail = $this->subject('Your order confirmation')->view('emails.order_confirmed', ['order' => $this->order, 'qr_codes' => $qr_codes]);

        // Try to generate a PDF using the Barryvdh Pdf facade if available
        if (class_exists('\\Barryvdh\\DomPDF\\Facade\\Pdf')) {
            try {
                $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('emails.order_confirmed_pdf', ['order' => $this->order, 'qr_codes' => $qr_codes])->output();
                $mail->attachData($pdf, "order-{$this->order->id}.pdf", ['mime' => 'application/pdf']);
            } catch (\Throwable $e) {
                $text = $this->generatePlainReceipt();
                $mail->attachData($text, "order-{$this->order->id}.txt", ['mime' => 'text/plain']);
            }
        } elseif (class_exists('\\Dompdf\\Dompdf')) {
            try {
                $dompdf = new \Dompdf\Dompdf();
                $html = view('emails.order_confirmed_pdf', ['order' => $this->order, 'qr_codes' => $qr_codes])->render();
                $dompdf->loadHtml($html);
                $dompdf->render();
                $pdf = $dompdf->output();
                $mail->attachData($pdf, "order-{$this->order->id}.pdf", ['mime' => 'application/pdf']);
            } catch (\Throwable $e) {
                $text = $this->generatePlainReceipt();
                $mail->attachData($text, "order-{$this->order->id}.txt", ['mime' => 'text/plain']);
            }
        } else {
            $text = $this->generatePlainReceipt();
            $mail->attachData($text, "order-{$this->order->id}.txt", ['mime' => 'text/plain']);
        }

        return $mail;
    }

    protected function generatePlainReceipt(): string
    {
        $lines = [];
        $lines[] = "Order #{$this->order->id}";
        $lines[] = "Date: " . $this->order->created_at->toDateTimeString();
        $lines[] = "";
        foreach ($this->order->items as $item) {
            $ticketName = $item->ticket?->name ?? 'Ticket';
            $eventTitle = $item->event?->title ?? null;
            $lines[] = sprintf("%s%s x%d — €%01.2f",
                $ticketName,
                $eventTitle ? " (Event: {$eventTitle})" : '',
                $item->quantity,
                $item->price
            );
        }
        $lines[] = "";
        $lines[] = sprintf("Total: €%01.2f", $this->order->total);
        return implode("\n", $lines);
    }
}

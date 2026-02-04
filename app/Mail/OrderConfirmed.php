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
        $mail = $this->subject('Your order confirmation')->view('emails.order_confirmed', ['order' => $this->order]);

        // Try to generate a PDF using the Barryvdh Pdf facade if available
        if (class_exists('\\Barryvdh\\DomPDF\\Facade\\Pdf')) {
            try {
                $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('emails.order_confirmed_pdf', ['order' => $this->order])->output();
                $mail->attachData($pdf, "order-{$this->order->id}.pdf", ['mime' => 'application/pdf']);
            } catch (\\Throwable $e) {
                $text = $this->generatePlainReceipt();
                $mail->attachData($text, "order-{$this->order->id}.txt", ['mime' => 'text/plain']);
            }
        } elseif (class_exists('\\Dompdf\\Dompdf')) {
            try {
                $dompdf = new \\Dompdf\\Dompdf();
                $html = view('emails.order_confirmed_pdf', ['order' => $this->order])->render();
                $dompdf->loadHtml($html);
                $dompdf->render();
                $pdf = $dompdf->output();
                $mail->attachData($pdf, "order-{$this->order->id}.pdf", ['mime' => 'application/pdf']);
            } catch (\\Throwable $e) {
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
            $lines[] = sprintf("%s x%d — €%01.2f", $item->ticket?->name ?? 'Item', $item->quantity, $item->price);
        }
        $lines[] = "";
        $lines[] = sprintf("Total: €%01.2f", $this->order->total);
        return implode("\n", $lines);
    }
}

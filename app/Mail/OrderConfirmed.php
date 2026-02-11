<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentSetting;
use App\Services\OrderTicketPdfBuilder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class OrderConfirmed extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Order $order,
        public ?OrderItem $item = null,
        public ?string $ticketHolderName = null,
        public ?string $ticketHolderEmail = null,
    ) {}

    /**
     * Build the message.
     */
    public function build()
    {
        // ensure related models are loaded for the email view (tickets + events)
        $this->order->loadMissing('items.ticket.event.organiser', 'items.ticket.event.organisers', 'user');
        $items = $this->order->items;
        if ($this->item) {
            if ($this->ticketHolderName) {
                $this->item->guest_details = [[
                    'name' => $this->ticketHolderName,
                    'email' => $this->ticketHolderEmail,
                ]];
            }
            $items = collect([$this->item]);
        }

        // generate QR codes for each order item (embed as data URIs when possible)
        $qr_codes = [];
        $qr_embeds = [];
        $event_images = [];
        $event_embeds = [];
        foreach ($items as $item) {
            $guestName = $this->ticketHolderName ?: ($this->order->contact_name ?? $this->order->user?->name ?? null);
            $guestEmail = $this->ticketHolderEmail ?: ($this->order->contact_email ?? $this->order->user?->email ?? null);
            $payload = json_encode([
                'booking_code' => $this->order->booking_code,
                'customer_name' => $guestName,
                'customer_email' => $guestEmail,
                'event' => $item->event?->title ?? null,
                'start_at' => $item->event?->start_at?->toDateString() ?? null,
                'ticket_type' => $item->ticket?->name ?? null,
            ]);
            $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data='.urlencode($payload);
            $data = @file_get_contents($qrUrl);
            if ($data !== false) {
                $qr_codes[$item->id] = 'data:image/png;base64,'.base64_encode($data);
                $qr_embeds[$item->id] = [
                    'data' => $data,
                    'mime' => 'image/png',
                    'name' => "qr-{$this->order->booking_code}-{$item->id}.png",
                ];
            } else {
                $qr_codes[$item->id] = $qrUrl;
            }

            $event_images[$item->id] = $this->resolveEventImage($item->event?->image_thumbnail, $item->event?->image_thumbnail_url, $item->event?->image);
            $embed = $this->resolveEventImageEmbed($item->event?->image_thumbnail, $item->event?->image, $item->id);
            if ($embed) {
                $event_embeds[$item->id] = $embed;
            }
        }

        $recipientEmail = $this->ticketHolderEmail ?: ($this->order->contact_email ?? $this->order->user?->email ?? null);
        $viewUrl = URL::signedRoute('orders.display', [
            'order' => $this->order->id,
            'email' => $recipientEmail,
        ]);
        $paymentMethod = $this->order->payment_method ?? 'bank_transfer';
        $paymentStatus = $this->order->payment_status ?? ($this->order->paid ? 'paid' : 'pending');
        $bank = $this->resolvePaymentDetailsFromOrder($items, $paymentMethod)
            ?? config('payments.'.$paymentMethod)
            ?? config('payments.bank_transfer');
        $logoUrl = asset('images/logo.png');
        // Ensure the From/Reply-To use the configured sending domain/address to reduce provider rejections
        $mail = $this->from(config('mail.from.address'), config('mail.from.name'))
            ->replyTo(config('mail.from.address'), config('mail.from.name'))
            ->subject('Your order confirmation — Booking code: '.$this->order->booking_code)
            ->view('emails.order_confirmed', [
                'order' => $this->order,
                'items' => $items,
                'qr_codes' => $qr_codes,
                'qr_embeds' => $qr_embeds,
                'view_url' => $viewUrl,
                'recipient_email' => $recipientEmail,
                'event_images' => $event_images,
                'event_embeds' => $event_embeds,
                'logo_url' => $logoUrl,
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentStatus,
                'bank' => $bank,
            ]);

        $pdfBuilder = app(OrderTicketPdfBuilder::class);
        $pdf = $pdfBuilder->buildPdf($this->order, $items, $this->ticketHolderName, $this->ticketHolderEmail);
        if ($pdf) {
            $mail->attachData($pdf, "order-{$this->order->booking_code}.pdf", ['mime' => 'application/pdf']);
        } else {
            Log::warning('OrderConfirmed PDF generation failed', [
                'order_id' => $this->order->id,
            ]);
            $text = $this->generatePlainReceipt();
            $mail->attachData($text, "order-{$this->order->booking_code}.txt", ['mime' => 'text/plain']);
        }

        return $mail;
    }

    protected function generatePlainReceipt(): string
    {
        $lines = [];
        $lines[] = "Order #{$this->order->id}";
        $lines[] = 'Date: '.$this->order->created_at->toDateTimeString();
        $lines[] = '';
        foreach ($this->order->items as $item) {
            $ticketName = $item->ticket?->name ?? 'Ticket type';
            $eventTitle = $item->event?->title ?? null;
            $lines[] = sprintf('%s%s x%d — €%01.2f',
                $ticketName,
                $eventTitle ? " (Event: {$eventTitle})" : '',
                $item->quantity,
                $item->price
            );
        }
        $lines[] = '';
        $lines[] = sprintf('Total: €%01.2f', $this->order->total);

        return implode("\n", $lines);
    }

    protected function resolveEventImage(?string $thumbnailPath, ?string $thumbnailUrl, ?string $imagePath): ?string
    {
        $path = $thumbnailPath ?: $imagePath;
        if (! $path && $thumbnailUrl) {
            $path = $thumbnailUrl;
        }

        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'data:') || str_starts_with($path, 'http')) {
            return $path;
        }

        $relative = $path;
        if (str_starts_with($relative, '/storage/')) {
            $relative = substr($relative, 9);
        } elseif (str_starts_with($relative, 'storage/')) {
            $relative = substr($relative, 8);
        }

        try {
            $filePath = Storage::disk('public')->path($relative);
            if (file_exists($filePath)) {
                $mime = mime_content_type($filePath) ?: 'image/jpeg';
                $data = file_get_contents($filePath);
                if ($data !== false) {
                    return 'data:'.$mime.';base64,'.base64_encode($data);
                }
            }
        } catch (\Throwable $e) {
            // ignore and fall back to URL
        }

        $url = $path;
        if (! str_starts_with($url, '/')) {
            $url = Storage::url($relative);
        }

        if (! str_starts_with($url, 'http')) {
            $url = config('app.url').(str_starts_with($url, '/') ? $url : '/'.$url);
        }

        return $url;
    }

    protected function resolveEventImageEmbed(?string $thumbnailPath, ?string $imagePath, int $itemId): ?array
    {
        $path = $thumbnailPath ?: $imagePath;
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'data:') || str_starts_with($path, 'http')) {
            return null;
        }

        $relative = $path;
        if (str_starts_with($relative, '/storage/')) {
            $relative = substr($relative, 9);
        } elseif (str_starts_with($relative, 'storage/')) {
            $relative = substr($relative, 8);
        }

        try {
            $filePath = Storage::disk('public')->path($relative);
            if (! file_exists($filePath)) {
                return null;
            }
            $data = file_get_contents($filePath);
            if ($data === false) {
                return null;
            }
            $mime = mime_content_type($filePath) ?: 'image/jpeg';
            $ext = pathinfo($filePath, PATHINFO_EXTENSION) ?: 'jpg';

            return [
                'data' => $data,
                'mime' => $mime,
                'name' => "event-{$this->order->id}-{$itemId}.{$ext}",
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    protected function resolvePaymentDetailsFromOrder($items, string $method): ?array
    {
        $base = PaymentSetting::paymentMethod($method) ?? config('payments.'.$method);

        return is_array($base) ? $base : null;
    }
}

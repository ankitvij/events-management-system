<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class OrderTicketPdfBuilder
{
    public function buildPdf(Order $order, Collection $items, ?string $ticketHolderName = null, ?string $ticketHolderEmail = null): ?string
    {
        $order->loadMissing('items.ticket.event', 'user');

        $itemsForPdf = $items->map(function (OrderItem $item) use ($ticketHolderName, $ticketHolderEmail) {
            $copy = clone $item;
            if ($ticketHolderName) {
                $copy->guest_details = [[
                    'name' => $ticketHolderName,
                    'email' => $ticketHolderEmail,
                ]];
            }

            return $copy;
        });

        $qrCodes = [];
        $eventImages = [];

        foreach ($itemsForPdf as $item) {
            $guestName = $ticketHolderName ?: ($order->contact_name ?? $order->user?->name ?? null);
            $guestEmail = $ticketHolderEmail ?: ($order->contact_email ?? $order->user?->email ?? null);
            $qrCodes[$item->id] = $this->buildQrCode($order, $item, $guestName, $guestEmail);
            $eventImages[$item->id] = $this->resolveEventImage(
                $item->event?->image_thumbnail,
                $item->event?->image_thumbnail_url,
                $item->event?->image
            );
        }

        $viewData = [
            'order' => $order,
            'items' => $itemsForPdf,
            'qr_codes' => $qrCodes,
            'event_images' => $eventImages,
        ];

        if (class_exists('\\Barryvdh\\DomPDF\\Facade\\Pdf')) {
            try {
                return \Barryvdh\DomPDF\Facade\Pdf::loadView('emails.order_confirmed_pdf', $viewData)
                    ->setOptions([
                        'isRemoteEnabled' => true,
                        'isHtml5ParserEnabled' => true,
                    ])
                    ->output();
            } catch (\Throwable $e) {
                return null;
            }
        }

        if (class_exists('\\Dompdf\\Dompdf')) {
            try {
                $dompdf = new \Dompdf\Dompdf;
                $html = view('emails.order_confirmed_pdf', $viewData)->render();
                $dompdf->set_option('isRemoteEnabled', true);
                $dompdf->set_option('isHtml5ParserEnabled', true);
                $dompdf->loadHtml($html);
                $dompdf->render();

                return $dompdf->output();
            } catch (\Throwable $e) {
                return null;
            }
        }

        return null;
    }

    public function buildSingleItemPdf(Order $order, OrderItem $item, ?string $ticketHolderName = null, ?string $ticketHolderEmail = null): ?string
    {
        return $this->buildPdf($order, collect([$item]), $ticketHolderName, $ticketHolderEmail);
    }

    protected function buildQrCode(Order $order, OrderItem $item, ?string $guestName, ?string $guestEmail): string
    {
        if (app()->runningUnitTests()) {
            return $this->placeholderQr();
        }

        $payload = json_encode([
            'booking_code' => $order->booking_code,
            'customer_name' => $guestName,
            'customer_email' => $guestEmail,
            'event' => $item->event?->title ?? null,
            'start_at' => $item->event?->start_at?->toDateString() ?? null,
            'ticket_type' => $item->ticket?->name ?? null,
        ]);

        $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data='.urlencode($payload);
        $data = @file_get_contents($qrUrl);

        if ($data !== false) {
            return 'data:image/png;base64,'.base64_encode($data);
        }

        return $qrUrl;
    }

    protected function placeholderQr(): string
    {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
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
}

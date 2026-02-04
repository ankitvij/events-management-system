<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

// for PDF generation
use Dompdf\Dompdf;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with('items.ticket', 'items.event', 'user')->latest()->paginate(20);
        return inertia('Orders/Index', ['orders' => $orders]);
    }

    public function show(Order $order)
    {
        $order->load('items.ticket', 'items.event', 'user');

        $current = auth()->user();
        if (! $current) {
            // Guests can view the order only if they provide the correct booking_code
            $provided = request('booking_code');
            if (! $provided || $provided !== $order->booking_code) {
                abort(404);
            }
        } else {
            // For authenticated users, allow only owners and super admins to view
            if (! ($current->is_super_admin || ($order->user_id && $current->id === $order->user_id))) {
                abort(404);
            }
        }

        return inertia('Orders/Show', ['order' => $order]);
    }

    public function receipt(Order $order)
    {
        $order->load('items.ticket', 'items.event', 'user');

        if (class_exists('\\Dompdf\\Dompdf')) {
            try {
                $dompdf = new Dompdf();
                $html = view('emails.order_confirmed_pdf', ['order' => $order])->render();
                $dompdf->loadHtml($html);
                $dompdf->render();
                $pdf = $dompdf->output();
                return Response::make($pdf, 200, [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => "attachment; filename=order-{$order->id}.pdf",
                ]);
            } catch (\Throwable $e) {
                // fallthrough to text fallback
            }
        }

        // Fallback: plain text receipt
        $lines = [];
        $lines[] = "Order #{$order->id}";
        $lines[] = "Date: " . $order->created_at;
        foreach ($order->items as $item) {
            $lines[] = sprintf("%s x%d — €%01.2f", $item->ticket?->name ?? 'Item', $item->quantity, $item->price);
        }
        $lines[] = sprintf("Total: €%01.2f", $order->total);
        return Response::make(implode("\n", $lines), 200, ['Content-Type' => 'text/plain']);
    }
}

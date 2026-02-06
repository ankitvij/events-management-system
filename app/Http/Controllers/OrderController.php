<?php

namespace App\Http\Controllers;

use App\Mail\OrderConfirmed;
use App\Models\Order;
use Dompdf\Dompdf;
// for PDF generation
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Response;

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
        $order->items->each(function ($item) {
            if ($item->event) {
                $item->event->append(['image_url', 'image_thumbnail_url']);
            }
        });
        $current = auth()->user();
        $customerId = session('customer_id');

        if ($current) {
            // For authenticated admin-style users, allow only owners and super admins to view
            if (! ($current->is_super_admin || ($order->user_id && $current->id === $order->user_id))) {
                abort(404);
            }
        } elseif ($customerId) {
            // Customers logged in via customer session can view only their orders
            if (! $order->customer_id || (int) $order->customer_id !== (int) $customerId) {
                abort(404);
            }
        } else {
            // Guests can view the order only if they provide the correct booking_code
            $provided = request('booking_code');
            if (! $provided || $provided !== $order->booking_code) {
                abort(404);
            }
        }

        return inertia('Orders/Show', ['order' => $order]);
    }

    // Public view: render a simple form asking for email + booking code
    public function publicView(Order $order)
    {
        return view('orders.public_view', ['order' => $order]);
    }

    // Verify posted email + booking code and redirect to display route
    public function publicVerify(Request $request, Order $order)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'booking_code' => ['required', 'string'],
        ]);

        // Check booking code and email
        if ($data['booking_code'] !== $order->booking_code) {
            return redirect()->back()->withErrors(['booking_code' => 'Invalid booking code']);
        }

        $emailMatches = false;
        if ($order->contact_email && $order->contact_email === $data['email']) {
            $emailMatches = true;
        }
        if ($order->user && $order->user->email === $data['email']) {
            $emailMatches = true;
        }

        if (! $emailMatches) {
            return redirect()->back()->withErrors(['email' => 'Email does not match our records']);
        }

        // Return the Inertia Orders/Show page directly so the POST (email+booking_code)
        // is the method used to view the order (guest flow requirement).
        $order->load('items.ticket', 'items.event', 'user');
        $order->items->each(function ($item) {
            if ($item->event) {
                $item->event->append(['image_url', 'image_thumbnail_url']);
            }
        });

        return inertia('Orders/Show', ['order' => $order]);
    }

    // Display order for guests after validation via query params
    public function display(Order $order)
    {
        $order->load('items.ticket', 'items.event', 'user');
        $order->items->each(function ($item) {
            if ($item->event) {
                $item->event->append(['image_url', 'image_thumbnail_url']);
            }
        });

        $provided = request('booking_code');
        $email = request('email');
        $customerId = session('customer_id');

        // If a customer is logged in and owns this order, allow access without booking code
        if ($customerId && $order->customer_id && (int) $order->customer_id === (int) $customerId) {
            return inertia('Orders/Show', ['order' => $order]);
        }

        if (! $provided || $provided !== $order->booking_code) {
            abort(404);
        }

        if ($email) {
            if ($order->contact_email && $email !== $order->contact_email) {
                abort(404);
            }
            if ($order->user && $email !== $order->user->email) {
                abort(404);
            }
        }

        return inertia('Orders/Show', ['order' => $order]);
    }

    public function receipt(Order $order)
    {
        $order->load('items.ticket', 'items.event', 'user');
        $current = auth()->user();
        $customerId = session('customer_id');

        if ($current) {
            if (! ($current->is_super_admin || ($order->user_id && $current->id === $order->user_id))) {
                abort(404);
            }
        } elseif ($customerId) {
            if (! $order->customer_id || (int) $order->customer_id !== (int) $customerId) {
                abort(404);
            }
        } else {
            $provided = request('booking_code');
            $email = request('email');
            if (! $provided || $provided !== $order->booking_code) {
                abort(404);
            }
            if ($email) {
                if ($order->contact_email && $email !== $order->contact_email) {
                    abort(404);
                }
                if ($order->user && $email !== $order->user->email) {
                    abort(404);
                }
            }
        }

        if (class_exists('\\Dompdf\\Dompdf')) {
            try {
                $dompdf = new Dompdf;
                $html = view('emails.order_confirmed_pdf', ['order' => $order])->render();
                $dompdf->loadHtml($html);
                $dompdf->render();
                $pdf = $dompdf->output();

                return Response::make($pdf, 200, [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => "attachment; filename=order-{$order->booking_code}.pdf",
                ]);
            } catch (\Throwable $e) {
                // fallthrough to text fallback
            }
        }

        // Fallback: plain text receipt
        $lines = [];
        $lines[] = "Booking code: {$order->booking_code}";
        $lines[] = 'Date: '.$order->created_at;
        foreach ($order->items as $item) {
            $lines[] = sprintf('%s x%d — €%01.2f', $item->ticket?->name ?? 'Item', $item->quantity, $item->price);
        }
        $lines[] = sprintf('Total: €%01.2f', $order->total);

        return Response::make(implode("\n", $lines), 200, ['Content-Type' => 'text/plain']);
    }

    // List orders for the currently logged-in customer (session-based)
    public function customerIndex()
    {
        $customerId = session('customer_id');
        if (! $customerId) {
            return redirect()->route('customer.login');
        }

        $orders = Order::with('items.ticket', 'items.event')->where('customer_id', $customerId)->latest()->paginate(20);

        return inertia('Orders/Index', ['orders' => $orders]);
    }

    // Send ticket email to provided booking_code + email (public POST endpoint)
    public function sendTicket(Request $request)
    {
        $data = $request->validate([
            'booking_code' => ['required', 'string'],
            'email' => ['required', 'email'],
        ]);

        $order = Order::where('booking_code', $data['booking_code'])->firstOrFail();

        $emailMatches = false;
        if ($order->contact_email && $order->contact_email === $data['email']) {
            $emailMatches = true;
        }
        if ($order->user && $order->user->email === $data['email']) {
            $emailMatches = true;
        }

        if (! $emailMatches) {
            return response()->json(['message' => 'Email does not match order records'], 422);
        }

        // Ensure relations loaded
        $order->loadMissing('items.ticket.event', 'user');

        foreach ($order->items as $item) {
            $names = collect(is_array($item->guest_details) ? $item->guest_details : [])
                ->pluck('name')
                ->filter()
                ->values();
            $total = max(1, (int) $item->quantity);
            for ($i = 0; $i < $total; $i++) {
                $name = $names->get($i);
                Mail::to($data['email'])->send(new OrderConfirmed($order, $item, $name));
            }
        }

        return response()->json(['message' => 'Email sent']);
    }
}

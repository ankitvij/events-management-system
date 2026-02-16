<?php

namespace App\Http\Controllers;

use App\Mail\OrderConfirmed;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentSetting;
use App\Services\OrderTicketPdfBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Str;
use ZipArchive;

class OrderController extends Controller
{
    protected const PAYMENT_STATUSES = [
        'pending',
        'paid',
        'not_paid',
        'failed',
        'refunded',
    ];

    public function markPaymentReceived(Order $order)
    {
        $this->authorizeOrderAdminAction($order, request());

        $order->payment_status = 'paid';
        $order->paid = true;
        $order->save();

        return redirect()->back()->with('success', 'Payment marked as received.');
    }

    public function updatePaymentStatus(Request $request, Order $order)
    {
        $this->authorizeOrderAdminAction($order, $request);

        $data = $request->validate([
            'payment_status' => ['required', 'string', 'in:'.implode(',', self::PAYMENT_STATUSES)],
        ]);

        $order->payment_status = $data['payment_status'];
        $order->paid = $data['payment_status'] === 'paid';
        $order->save();

        return redirect()->back()->with('success', 'Payment status updated.');
    }

    public function checkIn(Order $order)
    {
        $this->authorizeOrderAdminAction($order, request());

        $order->loadMissing('items');
        foreach ($order->items as $item) {
            $item->checked_in_quantity = max(1, (int) $item->quantity);
            $item->save();
        }

        $this->syncOrderCheckInState($order);

        return redirect()->back()->with('success', 'All tickets in this order are checked in.');
    }

    public function checkInItem(Order $order, OrderItem $item)
    {
        $this->authorizeOrderAdminAction($order, request());

        if ($item->order_id !== $order->id) {
            abort(404);
        }

        $quantity = max(1, (int) $item->quantity);
        $checkedIn = (int) ($item->checked_in_quantity ?? 0);

        if ($checkedIn >= $quantity) {
            return redirect()->back()->with('success', 'This ticket item is already fully checked in.');
        }

        $item->checked_in_quantity = min($quantity, $checkedIn + 1);
        $item->save();

        $this->syncOrderCheckInState($order);

        return redirect()->back()->with('success', 'One ticket checked in successfully.');
    }

    public function updateTicketHolder(Request $request, Order $order, OrderItem $item)
    {
        $current = auth()->user();
        $customerId = session('customer_id');
        $bookingOrderId = session('customer_booking_order_id');

        // Access control: only order owner, customer, or booking code session
        if ($current) {
            if (! ($current->is_super_admin || ($order->user_id && $current->id === $order->user_id) || $this->userCanManageOrderByAgency($current, $order))) {
                abort(403);
            }
        } elseif ($bookingOrderId) {
            if ((int) $bookingOrderId !== (int) $order->id) {
                abort(403);
            }
        } elseif ($customerId) {
            if (! $order->customer_id || (int) $order->customer_id !== (int) $customerId) {
                abort(403);
            }
        } else {
            $provided = request('booking_code');
            if (! $provided || $provided !== $order->booking_code) {
                abort(403);
            }
        }

        $data = $request->validate([
            'guest_details' => ['required', 'array'],
            'guest_details.*.name' => ['required', 'string', 'max:255'],
            'guest_details.*.email' => ['nullable', 'email', 'max:255'],
        ]);

        $item->guest_details = $data['guest_details'];
        $item->save();

        return response()->json(['success' => true, 'guest_details' => $item->guest_details]);
    }

    public function index(Request $request)
    {
        $query = Order::query()->with('items.event', 'user', 'customer');
        $current = $request->user();

        if ($current && $current->hasRole('agency') && ! $current->hasRole(['admin', 'super_admin'])) {
            $query->whereHas('items.event', function ($subQuery) use ($current): void {
                $subQuery->where('agency_id', $current->agency_id);
            });
        }

        $search = $request->string('q')->toString();
        if ($search === '') {
            $search = $request->string('search')->toString();
        }

        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($builder) use ($like): void {
                $builder
                    ->where('booking_code', 'like', $like)
                    ->orWhere('contact_name', 'like', $like)
                    ->orWhere('contact_email', 'like', $like)
                    ->orWhereHas('user', function ($subQuery) use ($like): void {
                        $subQuery->where('name', 'like', $like)->orWhere('email', 'like', $like);
                    })
                    ->orWhereHas('customer', function ($subQuery) use ($like): void {
                        $subQuery->where('name', 'like', $like)->orWhere('email', 'like', $like);
                    })
                    ->orWhereHas('items.event', function ($subQuery) use ($like): void {
                        $subQuery->where('title', 'like', $like);
                    });
            });
        }

        $sort = $request->string('sort')->toString();
        switch ($sort) {
            case 'booking_code_asc':
                $query->orderBy('booking_code', 'asc');
                break;
            case 'booking_code_desc':
                $query->orderBy('booking_code', 'desc');
                break;
            case 'name_asc':
                $query->orderBy('contact_name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('contact_name', 'desc');
                break;
            case 'email_asc':
                $query->orderBy('contact_email', 'asc');
                break;
            case 'email_desc':
                $query->orderBy('contact_email', 'desc');
                break;
            case 'event_asc':
                $query->orderBy(
                    OrderItem::query()
                        ->select('events.title')
                        ->join('events', 'events.id', '=', 'order_items.event_id')
                        ->whereColumn('order_items.order_id', 'orders.id')
                        ->orderBy('events.title')
                        ->limit(1),
                    'asc'
                );
                break;
            case 'event_desc':
                $query->orderBy(
                    OrderItem::query()
                        ->select('events.title')
                        ->join('events', 'events.id', '=', 'order_items.event_id')
                        ->whereColumn('order_items.order_id', 'orders.id')
                        ->orderByDesc('events.title')
                        ->limit(1),
                    'desc'
                );
                break;
            case 'date_asc':
                $query->orderBy('created_at', 'asc');
                break;
            case 'date_desc':
                $query->orderBy('created_at', 'desc');
                break;
            default:
                $query->latest();
                break;
        }

        $orders = $query->paginate(20)->withQueryString();

        return inertia('Orders/Index', ['orders' => $orders]);
    }

    public function show(Order $order)
    {
        $order->load('items.ticket', 'items.event.organiser', 'items.event.organisers', 'user', 'customer');
        $order->items->each(function ($item) {
            if ($item->event) {
                $item->event->append(['image_url', 'image_thumbnail_url']);
            }
        });
        $current = auth()->user();
        $customerId = session('customer_id');
        $bookingOrderId = session('customer_booking_order_id');
        $providedBookingCode = request('booking_code');

        if ($current) {
            $isSuper = (bool) ($current->is_super_admin ?? false);
            $isOwner = $order->user_id && $current->id === $order->user_id;
            $hasValidBookingCode = $providedBookingCode && $providedBookingCode === $order->booking_code;
            $isAgencyManager = $this->userCanManageOrderByAgency($current, $order);

            // Authenticated users can view if they are super admin, owners, or provide the matching booking code
            if (! ($isSuper || $isOwner || $isAgencyManager || $hasValidBookingCode)) {
                abort(404);
            }
        } elseif ($bookingOrderId) {
            if ((int) $bookingOrderId !== (int) $order->id) {
                abort(404);
            }
        } elseif ($customerId) {
            // Customers logged in via customer session can view only their orders
            if (! $order->customer_id || (int) $order->customer_id !== (int) $customerId) {
                abort(404);
            }
        } else {
            // Guests can view the order only if they provide the correct booking_code
            if (! $providedBookingCode || $providedBookingCode !== $order->booking_code) {
                abort(404);
            }
        }

        $paymentMethod = $order->payment_method ?? 'bank_transfer';
        $paymentDetails = $this->resolvePaymentDetailsFromOrder($order, $paymentMethod)
            ?? config('payments.'.$paymentMethod)
            ?? config('payments.bank_transfer');

        return inertia('Orders/Show', [
            'order' => $order,
            'payment_details' => $paymentDetails,
        ]);
    }

    protected function resolvePaymentDetailsFromOrder(Order $order, string $method): ?array
    {
        $base = PaymentSetting::paymentMethod($method) ?? config('payments.'.$method);

        return is_array($base) ? $base : null;
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

        if (request()->hasValidSignature()) {
            return inertia('Orders/Show', ['order' => $order]);
        }

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
        $this->authorizeOrderDownload($order, request());

        $pdfBuilder = app(OrderTicketPdfBuilder::class);
        $pdf = $pdfBuilder->buildPdf($order, $order->items);
        if ($pdf) {
            return Response::make($pdf, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => "attachment; filename=order-{$order->booking_code}.pdf",
            ]);
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

    public function downloadTicket(Order $order, OrderItem $item, Request $request)
    {
        if ($item->order_id !== $order->id) {
            abort(404);
        }

        $order->load('items.ticket', 'items.event', 'user');
        $this->authorizeOrderDownload($order, $request);

        $pdfBuilder = app(OrderTicketPdfBuilder::class);
        $files = $this->buildTicketFiles($order, $item, $pdfBuilder, $request->integer('ticket_index'));

        if (count($files) === 0) {
            abort(500, 'Unable to generate ticket PDFs');
        }

        if (count($files) === 1) {
            $filename = array_key_first($files);
            $pdf = $files[$filename];

            return Response::make($pdf, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => "attachment; filename={$filename}",
            ]);
        }

        $zipPath = $this->buildZip($files, "tickets-{$order->booking_code}-item-{$item->id}.zip");

        return response()->download($zipPath['path'], $zipPath['name'], ['Content-Type' => 'application/zip'])
            ->deleteFileAfterSend(true);
    }

    public function downloadAllTickets(Order $order, Request $request)
    {
        $order->load('items.ticket', 'items.event', 'user');
        $this->authorizeOrderDownload($order, $request);

        $pdfBuilder = app(OrderTicketPdfBuilder::class);
        $files = [];

        foreach ($order->items as $item) {
            $files = array_merge($files, $this->buildTicketFiles($order, $item, $pdfBuilder));
        }

        if (count($files) === 0) {
            abort(500, 'Unable to generate ticket PDFs');
        }

        $zipPath = $this->buildZip($files, "tickets-{$order->booking_code}.zip");

        return response()->download($zipPath['path'], $zipPath['name'], ['Content-Type' => 'application/zip'])
            ->deleteFileAfterSend(true);
    }

    // List orders for the currently logged-in customer (session-based)
    public function customerIndex()
    {
        $customerId = session('customer_id');
        $bookingOrderId = session('customer_booking_order_id');
        $bookingCode = session('customer_booking_code');
        $bookingEmail = session('customer_booking_email');

        if (! $customerId && ! $bookingOrderId) {
            return redirect()->route('customer.login');
        }

        if ($bookingOrderId) {
            $order = Order::with('items.ticket', 'items.event')
                ->where('id', $bookingOrderId)
                ->when($bookingCode, fn ($q) => $q->where('booking_code', $bookingCode))
                ->first();

            if (! $order) {
                return redirect()->route('customer.login');
            }

            if ($bookingEmail) {
                $matches = false;
                if ($order->contact_email && $order->contact_email === $bookingEmail) {
                    $matches = true;
                }
                if ($order->user && $order->user->email === $bookingEmail) {
                    $matches = true;
                }
                if (! $matches) {
                    return redirect()->route('customer.login');
                }
            }

            $orders = new \Illuminate\Pagination\LengthAwarePaginator([
                $order,
            ], 1, 20, 1, ['path' => url('customer/orders')]);
        } else {
            $orders = Order::with('items.ticket', 'items.event')
                ->where('customer_id', $customerId)
                ->latest()
                ->paginate(20);
        }

        if (request()->expectsJson() || app()->runningUnitTests()) {
            return response()->json(['orders' => $orders]);
        }

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

        if (! $this->orderHasAnyValidTickets($order)) {
            return response()->json(['message' => 'Tickets for this order have already been checked in and are no longer valid.'], 410);
        }

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

    public function sendTicketItem(Request $request, Order $order, OrderItem $item)
    {
        $this->authorizeOrderAdminAction($order, $request);

        if ($item->order_id !== $order->id) {
            abort(404);
        }

        $order->loadMissing('items.ticket.event', 'user');

        if (! $this->orderHasAnyValidTickets($order)) {
            return redirect()->back()->with('success', 'Tickets for this order are already checked in and no longer valid.');
        }

        $guestDetails = collect(is_array($item->guest_details) ? $item->guest_details : []);
        $ticketIndex = $request->integer('ticket_index');
        $total = max(1, (int) $item->quantity);
        $recipient = $request->string('email')->toString();

        if ($ticketIndex >= 1 && $ticketIndex <= $total) {
            $guest = $guestDetails->get($ticketIndex - 1, []);
            $name = is_array($guest) ? ($guest['name'] ?? null) : null;
            $email = is_array($guest) ? ($guest['email'] ?? null) : null;
            $to = $recipient !== '' ? $recipient : ($email ?: ($order->contact_email ?? $order->user?->email));
            if (! $to) {
                return redirect()->back()->with('success', 'No email available for this ticket.');
            }

            Mail::to($to)->send(new OrderConfirmed($order, $item, $name));

            return redirect()->back()->with('success', 'Ticket emailed successfully.');
        }

        for ($i = 0; $i < $total; $i++) {
            $guest = $guestDetails->get($i, []);
            $name = is_array($guest) ? ($guest['name'] ?? null) : null;
            $email = is_array($guest) ? ($guest['email'] ?? null) : null;
            $to = $email ?: ($order->contact_email ?? $order->user?->email);
            if (! $to) {
                continue;
            }

            Mail::to($to)->send(new OrderConfirmed($order, $item, $name));
        }

        return redirect()->back()->with('success', 'Tickets emailed successfully.');
    }

    protected function authorizeOrderDownload(Order $order, Request $request): void
    {
        if (! $this->orderHasAnyValidTickets($order)) {
            abort(410, 'Tickets for this order have already been checked in and are no longer valid.');
        }

        $current = $request->user();
        $customerId = session('customer_id');
        $email = $request->query('email');

        if ($current) {
            if (! ($current->is_super_admin || ($order->user_id && $current->id === $order->user_id) || $this->userCanManageOrderByAgency($current, $order))) {
                abort(404);
            }

            return;
        }

        if ($customerId) {
            if (! $order->customer_id || (int) $order->customer_id !== (int) $customerId) {
                abort(404);
            }

            return;
        }

        if ($request->hasValidSignature()) {
            if ($email) {
                if ($order->contact_email && $email !== $order->contact_email) {
                    abort(404);
                }
                if ($order->user && $email !== $order->user->email) {
                    abort(404);
                }
            }

            return;
        }

        $provided = $request->query('booking_code');

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

    protected function authorizeOrderAdminAction(Order $order, Request $request): void
    {
        $current = $request->user();
        if (! $current) {
            abort(403);
        }

        if (! ($current->is_super_admin || ($order->user_id && $current->id === $order->user_id) || $this->userCanManageOrderByAgency($current, $order))) {
            abort(403);
        }
    }

    protected function userCanManageOrderByAgency($current, Order $order): bool
    {
        if (! $current) {
            return false;
        }

        if (! $current->hasRole('agency') || $current->hasRole(['admin', 'super_admin'])) {
            return false;
        }

        if (! $current->agency_id) {
            return false;
        }

        $totalItems = $order->items()->count();
        if ($totalItems === 0) {
            return false;
        }

        $agencyItems = $order->items()->whereHas('event', function ($query) use ($current): void {
            $query->where('agency_id', $current->agency_id);
        })->count();

        return $agencyItems === $totalItems;
    }

    protected function orderHasAnyValidTickets(Order $order): bool
    {
        if ($order->checked_in) {
            return false;
        }

        $remaining = $this->remainingTicketCount($order);

        return $remaining > 0;
    }

    protected function syncOrderCheckInState(Order $order): void
    {
        $remaining = $this->remainingTicketCount($order);
        $order->checked_in = $remaining === 0;
        $order->save();
    }

    protected function remainingTicketCount(Order $order): int
    {
        $order->loadMissing('items');

        return (int) $order->items->sum(function (OrderItem $item) {
            $quantity = max(1, (int) $item->quantity);
            $checkedIn = max(0, (int) ($item->checked_in_quantity ?? 0));

            return max(0, $quantity - $checkedIn);
        });
    }

    protected function buildTicketFiles(Order $order, OrderItem $item, OrderTicketPdfBuilder $pdfBuilder, ?int $ticketIndex = null): array
    {
        $files = [];
        $guestDetails = is_array($item->guest_details) ? array_values($item->guest_details) : [];
        $total = max(1, (int) $item->quantity);
        $baseName = Str::slug($item->event?->title ?? $item->ticket?->name ?? 'ticket');

        $start = 0;
        $end = $total - 1;
        if ($ticketIndex !== null && $ticketIndex >= 1 && $ticketIndex <= $total) {
            $start = $ticketIndex - 1;
            $end = $ticketIndex - 1;
        }

        for ($i = $start; $i <= $end; $i++) {
            $guest = $guestDetails[$i] ?? [];
            $name = is_array($guest) ? ($guest['name'] ?? null) : null;
            $email = is_array($guest) ? ($guest['email'] ?? null) : null;
            $pdf = $pdfBuilder->buildSingleItemPdf($order, $item, $name, $email);
            if (! $pdf) {
                continue;
            }

            $suffix = $total > 1 ? '-'.($i + 1) : '';
            $files["{$baseName}-{$order->booking_code}-{$item->id}{$suffix}.pdf"] = $pdf;
        }

        return $files;
    }

    protected function buildZip(array $files, string $zipName): array
    {
        $zipPath = tempnam(sys_get_temp_dir(), 'order-tickets-');
        $zip = new ZipArchive;
        $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        foreach ($files as $name => $contents) {
            $zip->addFromString($name, $contents);
        }

        $zip->close();

        return ['path' => $zipPath, 'name' => $zipName];
    }
}

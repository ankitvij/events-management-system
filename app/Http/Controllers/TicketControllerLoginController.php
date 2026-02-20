<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\LoginToken;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TicketControllerLoginController extends Controller
{
    public function consumeToken(string $token): RedirectResponse
    {
        $hash = hash('sha256', $token);
        $record = LoginToken::query()
            ->where('type', 'ticket_controller')
            ->where('token_hash', $hash)
            ->firstOrFail();

        $email = strtolower(trim($record->email));
        $hasAssignments = \App\Models\EventTicketController::query()->where('email', $email)->exists();
        if (! $hasAssignments) {
            abort(403);
        }

        session()->put('ticket_controller_email', $email);

        return redirect()->route('ticket-controllers.scanner')->with('success', 'You are signed in as ticket controller.');
    }

    public function scanner(Request $request): Response|RedirectResponse
    {
        $email = (string) session('ticket_controller_email', '');
        if ($email === '') {
            return redirect('/')->withErrors(['ticket_controller' => 'Please use your ticket controller login link.']);
        }

        $eventIds = \App\Models\EventTicketController::query()
            ->where('email', $email)
            ->pluck('event_id')
            ->all();

        if (count($eventIds) === 0) {
            $request->session()->forget('ticket_controller_email');

            return redirect('/')->withErrors(['ticket_controller' => 'No event assignments found for this login.']);
        }

        $events = Event::query()
            ->whereIn('id', $eventIds)
            ->orderBy('start_at')
            ->get(['id', 'slug', 'title', 'start_at']);

        return Inertia::render('TicketControllers/Scanner', [
            'controllerEmail' => $email,
            'events' => $events,
        ]);
    }

    public function checkIn(Request $request): RedirectResponse
    {
        $email = (string) session('ticket_controller_email', '');
        if ($email === '') {
            return redirect('/')->withErrors(['ticket_controller' => 'Please sign in again.']);
        }

        $data = $request->validate([
            'payload' => ['required', 'string', 'max:5000'],
        ]);

        $scan = $this->extractScanData($data['payload']);
        if (! $scan) {
            return back()->with('ticketScan', [
                'status' => 'invalid',
                'label' => 'Invalid ticket',
                'detail' => 'QR payload could not be validated.',
            ]);
        }

        $eventIds = \App\Models\EventTicketController::query()
            ->where('email', $email)
            ->pluck('event_id')
            ->all();

        if (count($eventIds) === 0) {
            return back()->with('ticketScan', [
                'status' => 'invalid',
                'label' => 'Invalid ticket',
                'detail' => 'No assigned events found for this login.',
            ]);
        }

        $order = Order::query()
            ->where('booking_code', $scan['booking_code'])
            ->whereHas('items', function ($query) use ($eventIds): void {
                $query->whereIn('event_id', $eventIds);
            })
            ->with(['items' => function ($query) use ($eventIds): void {
                $query->whereIn('event_id', $eventIds)->with('event', 'ticket');
            }])
            ->first();

        if (! $order) {
            return back()->with('ticketScan', [
                'status' => 'invalid',
                'label' => 'Invalid ticket',
                'detail' => 'No matching ticket found for your assigned events.',
            ]);
        }

        if (strtolower((string) $order->status) !== 'paid') {
            return back()->with('ticketScan', [
                'status' => 'invalid',
                'label' => 'Invalid ticket',
                'detail' => 'Invalid ticket.',
            ]);
        }

        $itemToCheckIn = $order->items->first(function (OrderItem $item): bool {
            $quantity = max(1, (int) $item->quantity);
            $checkedIn = max(0, (int) ($item->checked_in_quantity ?? 0));

            return $checkedIn < $quantity;
        });

        if (! $itemToCheckIn) {
            return back()->with('ticketScan', [
                'status' => 'invalid',
                'label' => 'Invalid ticket',
                'detail' => 'Invalid ticket.',
            ]);
        }

        $quantity = max(1, (int) $itemToCheckIn->quantity);
        $checkedIn = max(0, (int) ($itemToCheckIn->checked_in_quantity ?? 0));
        $itemToCheckIn->checked_in_quantity = min($quantity, $checkedIn + 1);
        $itemToCheckIn->save();

        $this->syncOrderCheckInState($order);

        $remainingForBooking = (int) $order->items->sum(function (OrderItem $item): int {
            $itemQuantity = max(1, (int) $item->quantity);
            $itemCheckedIn = max(0, (int) ($item->checked_in_quantity ?? 0));

            return max(0, $itemQuantity - $itemCheckedIn);
        });

        $ticketName = $itemToCheckIn->ticket?->name ?? 'Ticket';

        return back()
            ->with('success', 'Ticket checked in successfully.')
            ->with('ticketScan', [
                'status' => 'ready_to_check_in',
                'label' => 'Ready to check in',
                'detail' => $ticketName.' checked in for booking code '.$order->booking_code.'. Remaining tickets: '.$remainingForBooking.'.',
            ]);
    }

    public function logout(Request $request): RedirectResponse
    {
        $request->session()->forget('ticket_controller_email');

        return redirect('/')->with('success', 'Ticket controller logged out.');
    }

    protected function extractScanData(string $payload): ?array
    {
        $trimmed = trim($payload);
        if ($trimmed === '') {
            return null;
        }

        $decoded = json_decode($trimmed, true);
        if (is_array($decoded) && isset($decoded['booking_code']) && is_string($decoded['booking_code'])) {
            return [
                'booking_code' => trim($decoded['booking_code']),
            ];
        }

        if (str_starts_with($trimmed, 'http://') || str_starts_with($trimmed, 'https://')) {
            $query = parse_url($trimmed, PHP_URL_QUERY);
            if (is_string($query)) {
                parse_str($query, $params);
                if (is_array($params) && isset($params['booking_code']) && is_string($params['booking_code'])) {
                    return [
                        'booking_code' => trim($params['booking_code']),
                    ];
                }
            }
        }

        if (preg_match('/^[A-Za-z0-9\-]{4,100}$/', $trimmed) === 1) {
            return [
                'booking_code' => $trimmed,
            ];
        }

        return null;
    }

    protected function syncOrderCheckInState(Order $order): void
    {
        $order->loadMissing('items');

        $remaining = (int) $order->items->sum(function (OrderItem $item): int {
            $quantity = max(1, (int) $item->quantity);
            $checkedIn = max(0, (int) ($item->checked_in_quantity ?? 0));

            return max(0, $quantity - $checkedIn);
        });

        $order->checked_in = $remaining === 0;
        $order->save();
    }
}

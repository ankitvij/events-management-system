<div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
    <h2>Payment reminder</h2>
    <p>This is a reminder that payment is still pending for your order.</p>

    <p><strong>Booking code:</strong> {{ $order->booking_code }}</p>
    <p><strong>Payment method:</strong> {{ ucfirst($paymentMethodLabel) }}</p>
    <p><strong>Total due:</strong> €{{ number_format((float) ($order->total ?? 0), 2) }}</p>

    <h3>Tickets</h3>
    <ul>
        @foreach($order->items as $item)
            <li>
                {{ $item->event?->title ?? 'Event' }} — {{ $item->ticket?->name ?? 'Ticket' }} x{{ $item->quantity }}
            </li>
        @endforeach
    </ul>

    <p>If payment has already been completed, please ignore this email.</p>
</div>

<div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
    @include('emails.partials.event_header')

    <h2>Order status updated</h2>
    <p>Your order status has changed.</p>

    <p><strong>Booking code:</strong> {{ $order->booking_code }}</p>
    <p><strong>Previous status:</strong> {{ $previousStatusLabel }}</p>
    <p><strong>New status:</strong> {{ $newStatusLabel }}</p>

    <h3>Tickets</h3>
    <ul>
        @foreach($order->items as $item)
            <li>
                {{ $item->event?->title ?? 'Event' }} — {{ $item->ticket?->name ?? 'Ticket' }} x{{ $item->quantity }}
            </li>
        @endforeach
    </ul>

    <p>If you have any questions, reply to this email and include booking code {{ $order->booking_code }}.</p>

    @include('emails.partials.chancepass_footer')
</div>

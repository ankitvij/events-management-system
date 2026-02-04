<div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
    <h2>Order #{{ $order->id }}</h2>
    <p>Thank you for your order.</p>

    <p>
        @if($order->contact_email)
            A confirmation has been sent to <strong>{{ $order->contact_email }}</strong>.
        @elseif($order->user?->email)
            A confirmation has been sent to <strong>{{ $order->user->email }}</strong>.
        @endif
    </p>

    <h3>Items</h3>
    <ul>
        @foreach($order->items as $item)
            <li>
                <div style="display:flex;gap:12px;align-items:center">
                    @if($item->event?->image_thumbnail_url)
                        <img src="{{ $item->event->image_thumbnail_url }}" alt="{{ $item->event->title }}" style="width:80px;height:56px;object-fit:cover;border-radius:4px" />
                    @endif
                    <div>
                        <div><strong>{{ $item->ticket?->name ?? 'Ticket' }}</strong> x{{ $item->quantity }} — €{{ number_format($item->price, 2) }}</div>
                        @if($item->event)
                            <div style="font-size:0.9em;color:#666">Event: {{ $item->event->title }} @if($item->event->start_at) ({{ $item->event->start_at->format('Y-m-d H:i') }})@endif</div>
                        @endif
                    </div>
                </div>
                @if(isset($qr_codes[$item->id]))
                    <div style="margin-top:8px">
                        <img src="{{ $qr_codes[$item->id] }}" alt="QR code" style="width:120px;height:120px" />
                    </div>
                @endif
            </li>
        @endforeach
    </ul>

    <p><strong>Total: €{{ number_format($order->total, 2) }}</strong></p>

    <p>If you have any questions, reply to this email or mention your order number <strong>#{{ $order->id }}</strong> when contacting us.</p>
</div>

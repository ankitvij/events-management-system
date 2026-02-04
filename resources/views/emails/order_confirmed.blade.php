<div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
    <h2>Order #{{ $order->id }}</h2>
    <p>Thank you for your order.</p>
    <ul>
        @foreach($order->items as $item)
            <li>{{ $item->ticket?->name ?? 'Item' }} x{{ $item->quantity }} — €{{ number_format($item->price, 2) }}</li>
        @endforeach
    </ul>
    <p><strong>Total: €{{ number_format($order->total, 2) }}</strong></p>
</div>

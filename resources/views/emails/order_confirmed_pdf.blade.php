<html>
	<head>
		<meta charset="utf-8">
		<style>
			body{font-family: DejaVu Sans, Helvetica, Arial; font-size:12px;} h1{font-size:18px;} .item{margin-bottom:8px;}
			.muted{color:#666;font-size:11px}
		</style>
	</head>
	<body>
		<h1>Order #{{ $order->id }}</h1>
		<p>Thank you for your order.</p>

		@if($order->contact_email ?? $order->user?->email)
			<p class="muted">A confirmation has been sent to <strong>{{ $order->contact_email ?? $order->user->email }}</strong></p>
		@endif

		<div>
			@foreach($order->items as $item)
				<div class="item" style="display:flex;gap:12px;align-items:center">
					@if($item->event?->image_thumbnail_url)
						<img src="{{ $item->event->image_thumbnail_url }}" alt="{{ $item->event->title }}" style="width:80px;height:56px;object-fit:cover;border-radius:4px" />
					@endif
					<div>
						<div><strong>{{ $item->ticket?->name ?? 'Ticket' }}</strong> x{{ $item->quantity }} — €{{ number_format($item->price,2) }}</div>
						@if($item->event)
							<div class="muted">Event: {{ $item->event->title }} @if($item->event->start_at) ({{ $item->event->start_at->format('Y-m-d H:i') }})@endif</div>
						@endif
					</div>
				</div>
				@if(isset($qr_codes[$item->id]))
					<div style="margin-top:8px"><img src="{{ $qr_codes[$item->id] }}" alt="QR code" style="width:120px;height:120px" /></div>
				@endif
			@endforeach
		</div>

		<p><strong>Total: €{{ number_format($order->total,2) }}</strong></p>

		<p class="muted">If you have questions, reply to this email or mention order number #{{ $order->id }}.</p>
	</body>
</html>

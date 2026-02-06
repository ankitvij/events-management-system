<html>
	<head>
		<meta charset="utf-8">
		<style>
			body{font-family: DejaVu Sans, Helvetica, Arial; font-size:12px;} h1{font-size:18px;} .item{margin-bottom:8px;}
			.muted{color:#666;font-size:11px}
		</style>
	</head>
	<body>
		@php
			$items = $items ?? $order->items;
			$firstItem = $items->first();
			$topImg = $firstItem ? ($event_images[$firstItem->id] ?? null) : null;
		@endphp
		@if($topImg)
			<img src="{{ $topImg }}" alt="Event image" style="max-width:100%;height:auto;border-radius:8px;display:block;margin-bottom:12px" />
		@endif

		<h1>Booking code: {{ $order->booking_code }}</h1>
		<p>Thank you for your order.</p>
		<p class="muted">Placed on: {{ $order->created_at?->format('Y-m-d H:i') }}</p>

		<div>
			@foreach($items as $item)
				<div class="item" style="display:flex;gap:12px;align-items:center">
					@php
						$img = $event_images[$item->id] ?? null;
						if (! $img && $item->event?->image_thumbnail_url) {
							$img = $item->event->image_thumbnail_url;
							if (! str_starts_with($img, 'http')) {
								$img = config('app.url') . (str_starts_with($img, '/') ? $img : '/' . $img);
							}
						}
					@endphp
					@if($img)
						<img src="{{ $img }}" alt="{{ $item->event->title }}" style="max-width:100%;height:auto;border-radius:8px;display:block" />
					@endif
					<div>
						<div><strong>Ticket type:</strong> {{ $item->ticket?->name ?? 'Ticket type' }} x{{ $item->quantity }} — €{{ number_format($item->price,2) }}</div>
						@if(is_array($item->guest_details) && count($item->guest_details) > 0)
							<div class="muted">Ticket holder: {{ collect($item->guest_details)->pluck('name')->filter()->join(', ') }}</div>
							@php
								$guestEmails = collect($item->guest_details)->pluck('email')->filter()->join(', ');
							@endphp
							@if($guestEmails)
								<div class="muted">Ticket holder email: {{ $guestEmails }}</div>
							@endif
						@endif
						@if($item->event)
							<div class="muted">Event: {{ $item->event->title }} @if($item->event->start_at) ({{ $item->event->start_at->format('Y-m-d') }})@endif</div>
							@if($item->event->facebook_url || $item->event->instagram_url || $item->event->whatsapp_url)
								<div class="muted" style="margin-top:4px">
									@if($item->event->facebook_url)
										{{ $item->event->facebook_url }}
									@endif
									@if($item->event->instagram_url)
										@if($item->event->facebook_url) · @endif
										{{ $item->event->instagram_url }}
									@endif
									@if($item->event->whatsapp_url)
										@if($item->event->facebook_url || $item->event->instagram_url) · @endif
										{{ $item->event->whatsapp_url }}
									@endif
								</div>
							@endif
						@endif
					</div>
				</div>
				@if(isset($qr_codes[$item->id]))
					<div style="margin-top:8px"><img src="{{ $qr_codes[$item->id] }}" alt="QR code" style="width:180px;height:180px" /></div>
				@endif
			@endforeach
		</div>

		<p class="muted">If you have questions, reply to this email and include your booking code.</p>
	</body>
</html>

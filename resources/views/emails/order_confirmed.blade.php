<div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
    @php
        $items = $items ?? $order->items;
        $firstItem = $items->first();
        $topEmbed = $firstItem ? ($event_embeds[$firstItem->id] ?? null) : null;
        $topImg = $firstItem ? ($event_images[$firstItem->id] ?? null) : null;
    @endphp
    @if($topEmbed)
        <img src="{{ $message->embedData($topEmbed['data'], $topEmbed['name'], $topEmbed['mime']) }}" alt="Event image" style="max-width:100%;height:auto;border-radius:6px;display:block;margin-bottom:12px" />
    @elseif($topImg)
        <img src="{{ $topImg }}" alt="Event image" style="max-width:100%;height:auto;border-radius:6px;display:block;margin-bottom:12px" />
    @endif

    <h2>Booking code: {{ $order->booking_code }}</h2>
    <p>Thank you for your order.</p>
    <p class="muted">Placed on: {{ $order->created_at?->format('Y-m-d H:i') }}</p>

    <h3>Ticket types</h3>
    <ul>
        @foreach($items as $item)
            <li>
                <div style="display:flex;gap:12px;align-items:center">
                    <div>
                        <div><strong>Ticket type:</strong> {{ $item->ticket?->name ?? 'Ticket type' }} x{{ $item->quantity }} — €{{ number_format($item->price, 2) }}</div>
                        @if(is_array($item->guest_details) && count($item->guest_details) > 0)
                            <div style="font-size:0.9em;color:#666">Name(s): {{ collect($item->guest_details)->pluck('name')->filter()->join(', ') }}</div>
                            @php
                                $guestEmails = collect($item->guest_details)->pluck('email')->filter()->join(', ');
                            @endphp
                            @if($guestEmails)
                                <div style="font-size:0.9em;color:#666">Email(s): {{ $guestEmails }}</div>
                            @endif
                        @endif
                        @if($item->event)
                            <div style="font-size:0.9em;color:#666">Event: {{ $item->event->title }} @if($item->event->start_at) ({{ $item->event->start_at->format('Y-m-d') }})@endif</div>
                            @if($item->event->facebook_url || $item->event->instagram_url || $item->event->whatsapp_url)
                                <div style="font-size:0.9em;color:#666;margin-top:4px">
                                    @if($item->event->facebook_url)
                                        <a href="{{ $item->event->facebook_url }}" style="color:#2563eb">Facebook</a>
                                    @endif
                                    @if($item->event->instagram_url)
                                        @if($item->event->facebook_url) · @endif
                                        <a href="{{ $item->event->instagram_url }}" style="color:#2563eb">Instagram</a>
                                    @endif
                                    @if($item->event->whatsapp_url)
                                        @if($item->event->facebook_url || $item->event->instagram_url) · @endif
                                        <a href="{{ $item->event->whatsapp_url }}" style="color:#2563eb">WhatsApp</a>
                                    @endif
                                </div>
                            @endif
                        @endif
                    </div>
                </div>
            </li>
        @endforeach
    </ul>

    <p><strong>Total: €{{ number_format($order->total, 2) }}</strong></p>

    <p>If you have any questions, reply to this email and include your booking code when contacting us.</p>
    <p style="margin-top:12px">View your order online: <a href="{{ $view_url }}">{{ $view_url }}</a></p>
    @if($manage_url && $recipient_email && ($recipient_email === $order->contact_email || $recipient_email === ($order->user?->email ?? null)))
        <p style="margin-top:12px">Manage your order: <a href="{{ $manage_url }}">{{ $manage_url }}</a></p>
        <p style="font-size:0.9em;color:#666">You can sign in with your password or your booking code.</p>
    @endif
</div>

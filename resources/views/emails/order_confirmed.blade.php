<div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
    @php
        $items = $items ?? $order->items;
        $firstItem = $items->first();
        $topEmbed = $firstItem ? ($event_embeds[$firstItem->id] ?? null) : null;
        $topImg = $firstItem ? ($event_images[$firstItem->id] ?? null) : null;
        $logoUrl = $logo_url ?? asset('images/logo.png');
    @endphp
    <div style="margin-bottom:12px;text-align:left">
        <img src="{{ $logoUrl }}" alt="{{ config('app.name') }} logo" style="height:42px;width:auto" />
    </div>
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
                @php
                    $qrEmbed = $qr_embeds[$item->id] ?? null;
                @endphp
                @if($qrEmbed)
                    <div style="margin-top:8px">
                        <img src="{{ $message->embedData($qrEmbed['data'], $qrEmbed['name'], $qrEmbed['mime']) }}" alt="QR code" style="width:180px;height:180px" />
                    </div>
                @elseif(isset($qr_codes[$item->id]))
                    <div style="margin-top:8px">
                        <img src="{{ $qr_codes[$item->id] }}" alt="QR code" style="width:180px;height:180px" />
                    </div>
                @endif
            </li>
        @endforeach
    </ul>

    <p><strong>Total: €{{ number_format($order->total, 2) }}</strong></p>
    @php
        $paymentMethod = $payment_method ?? null;
        $paymentLabel = $bank['display_name'] ?? ($paymentMethod ? ucfirst(str_replace('_', ' ', $paymentMethod)) : 'Transfer');
    @endphp
    @if(in_array($paymentMethod, ['bank_transfer', 'paypal_transfer', 'revolut_transfer'], true))
        <div style="margin-top:12px;padding:12px;border:1px solid #e5e7eb;border-radius:6px;background:#f8fafc;">
            <p style="margin:0 0 6px 0;"><strong>Payment method:</strong> {{ $paymentLabel }}</p>
            <p style="margin:0 0 6px 0;">Status: {{ ($payment_status ?? 'pending') === 'paid' ? 'Paid' : 'Pending payment' }}</p>
            <p style="margin:0 0 6px 0;">Please transfer the total and include your booking code ({{ $order->booking_code }}) in the reference.</p>
            @if($paymentMethod === 'bank_transfer')
                <ul style="margin:0 0 6px 18px;padding:0;">
                    @if(!empty($bank['account_name']))
                        <li><strong>Account name:</strong> {{ $bank['account_name'] }}</li>
                    @endif
                    @if(!empty($bank['iban']))
                        <li><strong>IBAN:</strong> {{ $bank['iban'] }}</li>
                    @endif
                    @if(!empty($bank['bic']))
                        <li><strong>BIC/SWIFT:</strong> {{ $bank['bic'] }}</li>
                    @endif
                </ul>
            @else
                <ul style="margin:0 0 6px 18px;padding:0;">
                    @if(!empty($bank['account_id']))
                        <li><strong>Account ID:</strong> {{ $bank['account_id'] }}</li>
                    @endif
                </ul>
            @endif
            @if(!empty($bank['instructions']))
                <p style="margin:0 0 6px 0;">{{ $bank['instructions'] }}</p>
            @endif
            @if(!empty($bank['reference_hint']))
                <p style="margin:0;">{{ $bank['reference_hint'] }}</p>
            @endif
        </div>
    @endif

    <p>If you have any questions, reply to this email and include your booking code when contacting us.</p>
    @if(!empty($show_view_button))
        <div style="margin-top:16px">
            <a href="{{ $view_url }}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600">View your order</a>
        </div>
    @endif
</div>

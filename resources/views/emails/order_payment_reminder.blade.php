<div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
    @include('emails.partials.event_header')

    <h2>Payment reminder</h2>
    <p>This is a reminder that payment is still pending for your order.</p>

    <p><strong>Booking code:</strong> {{ $order->booking_code }}</p>
    <p><strong>Total due:</strong> €{{ number_format((float) ($order->total ?? 0), 2) }}</p>

    <h3>Payment details</h3>
    <p>Please use one of the following payment methods and include booking code <strong>{{ $order->booking_code }}</strong> where applicable.</p>

    <div style="margin-top: 10px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; background: #f8fafc;">
        <p style="margin: 0 0 8px 0;"><strong>{{ $paymentMethods['bank_transfer']['display_name'] ?? 'Bank transfer' }}</strong></p>
        <ul style="margin: 0 0 8px 18px; padding: 0;">
            @if(!empty($paymentMethods['bank_transfer']['account_name']))
                <li><strong>Account name:</strong> {{ $paymentMethods['bank_transfer']['account_name'] }}</li>
            @endif
            @if(!empty($paymentMethods['bank_transfer']['iban']))
                <li><strong>IBAN:</strong> {{ $paymentMethods['bank_transfer']['iban'] }}</li>
            @endif
            @if(!empty($paymentMethods['bank_transfer']['bic']))
                <li><strong>BIC/SWIFT:</strong> {{ $paymentMethods['bank_transfer']['bic'] }}</li>
            @endif
            @if(!empty($paymentMethods['bank_transfer']['reference_hint']))
                <li><strong>Reference:</strong> {{ $paymentMethods['bank_transfer']['reference_hint'] }}</li>
            @endif
        </ul>
        @if(!empty($paymentMethods['bank_transfer']['instructions']))
            <p style="margin: 0;">{{ $paymentMethods['bank_transfer']['instructions'] }}</p>
        @endif
    </div>

    <div style="margin-top: 10px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; background: #f8fafc;">
        <p style="margin: 0 0 8px 0;"><strong>{{ $paymentMethods['paypal_transfer']['display_name'] ?? 'PayPal' }}</strong></p>
        <ul style="margin: 0 0 8px 18px; padding: 0;">
            @if(!empty($paymentMethods['paypal_transfer']['account_id']))
                <li><strong>Account ID:</strong> {{ $paymentMethods['paypal_transfer']['account_id'] }}</li>
            @endif
        </ul>
        @if(!empty($paymentMethods['paypal_transfer']['instructions']))
            <p style="margin: 0;">{{ $paymentMethods['paypal_transfer']['instructions'] }}</p>
        @endif
    </div>

    <div style="margin-top: 10px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; background: #f8fafc;">
        <p style="margin: 0 0 8px 0;"><strong>{{ $paymentMethods['revolut_transfer']['display_name'] ?? 'Revolut' }}</strong></p>
        <ul style="margin: 0 0 8px 18px; padding: 0;">
            @if(!empty($paymentMethods['revolut_transfer']['account_id']))
                <li><strong>Account ID:</strong> {{ $paymentMethods['revolut_transfer']['account_id'] }}</li>
            @endif
        </ul>
        @if(!empty($paymentMethods['revolut_transfer']['instructions']))
            <p style="margin: 0;">{{ $paymentMethods['revolut_transfer']['instructions'] }}</p>
        @endif
    </div>

    <h3>Tickets</h3>
    <ul>
        @foreach($order->items as $item)
            <li>
                {{ $item->event?->title ?? 'Event' }} — {{ $item->ticket?->name ?? 'Ticket' }} x{{ $item->quantity }}
            </li>
        @endforeach
    </ul>

    <p>If payment has already been completed, please ignore this email.</p>

    @include('emails.partials.chancepass_footer')
</div>

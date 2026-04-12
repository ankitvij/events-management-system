<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Stripe Connect Storefront</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; }
        .wrap { max-width: 980px; margin: 0 auto; padding: 24px; }
        .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .btn { display: inline-block; border: 0; border-radius: 8px; background: #111827; color: #ffffff; padding: 10px 14px; cursor: pointer; text-decoration: none; }
        .alert { border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; }
        .alert.error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
        .grid { display: grid; gap: 14px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .card { background: #ffffff; border: 1px solid #d1d5db; border-radius: 10px; padding: 14px; }
        .muted { color: #6b7280; font-size: 14px; }
        .price { font-size: 20px; font-weight: 700; margin: 6px 0; }
        .row { display: flex; gap: 10px; align-items: center; margin-top: 10px; }
        input[type="number"] { width: 80px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px; }
        @media (max-width: 760px) { .grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
<div class="wrap">
    <div class="toolbar">
        <h1>Storefront</h1>
        <a class="btn" href="{{ route('stripe.connect.dashboard') }}">Back to Connect dashboard</a>
    </div>

    @if (session('error'))
        <div class="alert error">{{ session('error') }}</div>
    @endif

    <p class="muted">This sample storefront lists all products and routes checkout to Stripe hosted checkout. Destination charges route funds to each product's connected account.</p>

    <div class="grid">
        @forelse ($products as $product)
            <div class="card">
                <h2 style="margin: 0 0 6px;">{{ $product->name }}</h2>
                <div class="muted">{{ $product->description ?: 'No description provided.' }}</div>
                <div class="price">{{ strtoupper($product->currency) }} {{ number_format($product->unit_amount / 100, 2) }}</div>
                <div class="muted">Connected account: {{ $product->connectedAccount?->stripe_account_id }}</div>
                <div class="muted">Merchant: {{ $product->connectedAccount?->user?->name ?? 'Unknown' }}</div>

                <form method="post" action="{{ route('stripe.connect.storefront.purchase', $product) }}" class="row">
                    @csrf
                    <label for="qty-{{ $product->id }}">Qty</label>
                    <input id="qty-{{ $product->id }}" type="number" min="1" max="25" name="quantity" value="1">
                    <button type="submit" class="btn">Buy</button>
                </form>
            </div>
        @empty
            <div class="card">
                <p class="muted">No products are available yet.</p>
            </div>
        @endforelse
    </div>
</div>
</body>
</html>

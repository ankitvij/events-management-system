<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Payment Success</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; }
        .wrap { max-width: 700px; margin: 80px auto; padding: 20px; }
        .card { background: #ffffff; border: 1px solid #d1d5db; border-radius: 10px; padding: 20px; }
        .btn { display: inline-block; border: 0; border-radius: 8px; background: #111827; color: #ffffff; padding: 10px 14px; cursor: pointer; text-decoration: none; }
        .muted { color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
<div class="wrap">
    <div class="card">
        <h1>Payment successful</h1>
        <p>Your Stripe checkout payment has completed.</p>
        <p class="muted">Checkout Session ID: {{ $sessionId ?: 'not provided' }}</p>
        <a href="{{ route('stripe.connect.storefront') }}" class="btn">Back to storefront</a>
    </div>
</div>
</body>
</html>

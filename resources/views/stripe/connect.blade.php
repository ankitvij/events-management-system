<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Stripe Connect Demo</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f6f7fb; color: #111827; margin: 0; }
        .wrap { max-width: 980px; margin: 0 auto; padding: 24px; }
        .card { background: #ffffff; border: 1px solid #d1d5db; border-radius: 10px; padding: 18px; margin-bottom: 18px; }
        h1, h2 { margin: 0 0 12px; }
        .muted { color: #6b7280; font-size: 14px; }
        label { display: block; font-size: 14px; font-weight: 600; margin-top: 10px; }
        input, textarea, select { width: 100%; box-sizing: border-box; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-top: 6px; }
        textarea { min-height: 80px; }
        .row { display: grid; gap: 12px; grid-template-columns: 1fr 1fr; }
        .btn { display: inline-block; border: 0; border-radius: 8px; background: #111827; color: #ffffff; padding: 10px 14px; cursor: pointer; text-decoration: none; }
        .btn.secondary { background: #475569; }
        .alert { border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; }
        .alert.success { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
        .alert.error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; border-bottom: 1px solid #e5e7eb; padding: 8px; font-size: 14px; }
        .pill { display: inline-block; padding: 4px 8px; border-radius: 999px; font-size: 12px; }
        .pill.ok { background: #dcfce7; color: #166534; }
        .pill.wait { background: #fef3c7; color: #92400e; }
        @media (max-width: 760px) { .row { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
<div class="wrap">
    <h1>Stripe Connect Sample</h1>
    <p class="muted">Demo flow for connected account onboarding, product creation, and storefront checkout.</p>

    @if (session('success'))
        <div class="alert success">{{ session('success') }}</div>
    @endif
    @if (session('error'))
        <div class="alert error">{{ session('error') }}</div>
    @endif

    <div class="card">
        <h2>1) Connected Account</h2>
        <p class="muted">Create one connected account mapped to the current authenticated user.</p>

        @if (!$connectedAccount)
            <form method="post" action="{{ route('stripe.connect.account.create') }}">
                @csrf
                <div class="row">
                    <div>
                        <label for="display_name">Display name</label>
                        <input id="display_name" name="display_name" required value="{{ old('display_name') }}" placeholder="Example Merchant LLC">
                    </div>
                    <div>
                        <label for="contact_email">Contact email</label>
                        <input id="contact_email" type="email" name="contact_email" required value="{{ old('contact_email', auth()->user()?->email) }}" placeholder="merchant@example.com">
                    </div>
                </div>
                <div class="row">
                    <div>
                        <label for="country">Country (2-letter)</label>
                        <input id="country" name="country" maxlength="2" required value="{{ old('country', 'US') }}" placeholder="US">
                    </div>
                </div>
                <div style="margin-top: 12px;">
                    <button type="submit" class="btn">Create connected account</button>
                </div>
            </form>
        @else
            <p><strong>Mapped account:</strong> {{ $connectedAccount->stripe_account_id }}</p>
            @if ($statusError)
                <div class="alert error">Status lookup error: {{ $statusError }}</div>
            @elseif ($accountStatus)
                <p>
                    <span class="pill {{ $accountStatus['onboarding_complete'] ? 'ok' : 'wait' }}">Onboarding: {{ $accountStatus['onboarding_complete'] ? 'Complete' : 'Incomplete' }}</span>
                    <span class="pill {{ $accountStatus['ready_to_receive_payments'] ? 'ok' : 'wait' }}">Transfers: {{ $accountStatus['ready_to_receive_payments'] ? 'Active' : 'Not active' }}</span>
                </p>
                <p class="muted">Requirements status: {{ $accountStatus['requirements_status'] ?? 'unknown' }}</p>
            @endif

            <form method="post" action="{{ route('stripe.connect.onboarding.link') }}">
                @csrf
                <button type="submit" class="btn secondary">Onboard to collect payments</button>
            </form>
        @endif
    </div>

    <div class="card">
        <h2>2) Create Product (Platform Level)</h2>
        <p class="muted">Creates Stripe products on your platform account, then stores mapping to connected account in DB.</p>

        <form method="post" action="{{ route('stripe.connect.products.create') }}">
            @csrf
            <div class="row">
                <div>
                    <label for="name">Product name</label>
                    <input id="name" name="name" required value="{{ old('name') }}" placeholder="VIP Ticket">
                </div>
                <div>
                    <label for="currency">Currency</label>
                    <input id="currency" name="currency" required maxlength="3" value="{{ old('currency', 'usd') }}" placeholder="usd">
                </div>
            </div>
            <div class="row">
                <div>
                    <label for="unit_amount">Price (in cents)</label>
                    <input id="unit_amount" name="unit_amount" type="number" min="50" required value="{{ old('unit_amount', 2500) }}">
                </div>
                <div>
                    <label for="stripe_connected_account_id">Connected account mapping</label>
                    <select id="stripe_connected_account_id" name="stripe_connected_account_id" required>
                        <option value="">Select connected account</option>
                        @foreach (\App\Models\StripeConnectedAccount::query()->with('user:id,name,email')->orderByDesc('id')->get() as $mapping)
                            <option value="{{ $mapping->id }}">{{ $mapping->stripe_account_id }} ({{ $mapping->user?->name ?? $mapping->user?->email ?? 'Unknown user' }})</option>
                        @endforeach
                    </select>
                </div>
            </div>
            <div>
                <label for="description">Description</label>
                <textarea id="description" name="description" placeholder="Short description shown in Stripe checkout">{{ old('description') }}</textarea>
            </div>
            <div style="margin-top: 12px;">
                <button type="submit" class="btn">Create product</button>
                <a href="{{ route('stripe.connect.storefront') }}" class="btn secondary">Open storefront</a>
            </div>
        </form>
    </div>

    <div class="card">
        <h2>Mapped Products</h2>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Currency</th>
                    <th>Connected account</th>
                    <th>Stripe product</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($products as $product)
                    <tr>
                        <td>{{ $product->name }}</td>
                        <td>{{ number_format($product->unit_amount / 100, 2) }}</td>
                        <td>{{ strtoupper($product->currency) }}</td>
                        <td>{{ $product->connectedAccount?->stripe_account_id }}</td>
                        <td>{{ $product->stripe_product_id }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="muted">No products created yet.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
</body>
</html>

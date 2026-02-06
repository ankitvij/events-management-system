<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>View your order</title>
    <link rel="stylesheet" href="/build/assets/app-DtuY2Y-T.css">
</head>
<body class="p-6">
    <div class="max-w-md mx-auto">
        <h1 class="text-xl font-semibold mb-4">View Order</h1>
        @if ($errors->any())
            <div class="bg-red-50 border border-red-200 p-3 mb-4">
                <ul class="text-sm text-red-700">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form method="POST" action="{{ route('orders.public.verify', ['order' => $order->id]) }}" class="space-y-4">
            @csrf
            <div>
                <label class="block text-sm font-medium">Email</label>
                <input type="email" name="email" required class="mt-1 block w-full border rounded px-2 py-1" />
            </div>

            <div>
                <label class="block text-sm font-medium">Booking code</label>
                <input type="text" name="booking_code" required class="mt-1 block w-full border rounded px-2 py-1" />
            </div>

            <div class="pt-2">
                <button type="submit" class="inline-flex items-center px-3 py-2 rounded bg-blue-600 text-white">View order</button>
            </div>
        </form>
    </div>
</body>
</html>

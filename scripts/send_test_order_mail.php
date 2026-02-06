<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Mail\OrderConfirmed;
use App\Models\Order;
use Illuminate\Support\Facades\Mail;

$order = Order::latest()->first();
if (! $order) {
    fwrite(STDERR, "No orders found.\n");
    exit(1);
}

try {
    Mail::to('ankitvijtech@gmail.com')->send(new OrderConfirmed($order));
    echo "Mail send attempted successfully.\n";
} catch (Throwable $e) {
    fwrite(STDERR, "Mail send failed: {$e->getMessage()}\n");
    exit(1);
}

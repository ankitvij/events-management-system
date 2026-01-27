<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Event;

$events = Event::with('organisers')->orderBy('id')->get();
if ($events->isEmpty()) {
    echo "No events found\n";
    exit;
}

foreach ($events as $e) {
    $names = $e->organisers->pluck('name')->toArray();
    echo "{$e->id}\t{$e->title}\torganisers: ".(empty($names) ? 'none' : implode(', ', $names))."\n";
}

return 0;

<?php

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Event;

$events = Event::orderBy('id')->take(20)->get();
$result = [];
foreach ($events as $e) {
    $result[] = [
        'id' => $e->id,
        'title' => $e->title,
        'start_at' => $e->start_at ? $e->start_at->toDateTimeString() : null,
        'end_at' => $e->end_at ? $e->end_at->toDateTimeString() : null,
        'active' => (bool) $e->active,
    ];
}

echo json_encode($result, JSON_PRETTY_PRINT).PHP_EOL;

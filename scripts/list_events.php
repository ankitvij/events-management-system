<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Event;

$events = Event::all();
if ($events->isEmpty()) {
    echo "No events found\n";
    exit;
}
foreach ($events as $e) {
    echo $e->id."\t".$e->title."\t".$e->start_at."\t".$e->location."\n";
}

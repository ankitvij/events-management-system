<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Event;
use App\Models\Organiser;

echo "Assigning random organisers to events...\n";

$organisers = Organiser::orderBy('id')->get();
$orgIds = $organisers->pluck('id')->toArray();
$orgCount = count($orgIds);

if ($orgCount === 0) {
    echo "No organisers found. Aborting.\n";
    exit(1);
}

$events = Event::all();
$total = 0;

foreach ($events as $event) {
    // choose between 1 and 3 organisers (or up to available count)
    $max = min(3, $orgCount);
    $pick = rand(1, $max);

    $shuffled = $orgIds;
    shuffle($shuffled);
    $pickIds = array_slice($shuffled, 0, $pick);

    $event->organisers()->sync($pickIds);
    $total++;
    echo "Event {$event->id} ({$event->title}) -> organisers: ".implode(',', $pickIds)."\n";
}

echo "Assigned organisers to {$total} events.\n";

return 0;

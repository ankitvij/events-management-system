<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Event;
use App\Models\User;

// Create or fetch Ankit
$ankit = User::firstWhere('email', 'ankit@example.com');
if (! $ankit) {
    $ankit = User::create([
        'name' => 'Ankit',
        'email' => 'ankit@example.com',
        'password' => bcrypt('password'),
    ]);
    echo "Created user Ankit (id={$ankit->id})\n";
} else {
    echo "Found user Ankit (id={$ankit->id})\n";
}

// Assign events with id <= 6 to Ankit (these are the earlier factory events)
$affected = Event::where('id', '<=', 6)->update(['user_id' => $ankit->id]);
echo "Assigned {$affected} events to Ankit\n";

// Show resulting mapping for those events
$events = Event::where('id', '<=', 11)->orderBy('id')->get();
foreach ($events as $e) {
    echo "{$e->id}\t{$e->title}\tuser_id={$e->user_id}\n";
}

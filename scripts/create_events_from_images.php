<?php

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Event;
use App\Models\User;

$dir = __DIR__.'/../storage/app/public/events';
if (! is_dir($dir)) {
    echo "Events directory not found: $dir\n";
    exit(1);
}

$email = 'ankitvijtech@gmail.com';
$user = User::where('email', $email)->first();
if (! $user) {
    echo "User $email not found. Create the user first.\n";
    exit(1);
}

$files = scandir($dir);
$count = 0;
$days = 1;
foreach ($files as $file) {
    if ($file === '.' || $file === '..' || $file === 'thumbnails') {
        continue;
    }

    $path = $dir . DIRECTORY_SEPARATOR . $file;
    if (! is_file($path)) {
        continue;
    }

    $ext = pathinfo($file, PATHINFO_EXTENSION);
    if (! in_array(strtolower($ext), ['jpg', 'jpeg', 'png', 'gif'])) {
        continue;
    }

    $title = pathinfo($file, PATHINFO_FILENAME);
    $title = str_replace(['-', '_'], ' ', $title);
    $title = ucwords($title);

    $image = 'events/' . $file;
    $thumbFile = pathinfo($file, PATHINFO_FILENAME) . '-thumb.' . $ext;
    $image_thumbnail = 'events/thumbnails/' . $thumbFile;

    $startAt = now()->addDays($days)->startOfDay()->addHours(18);

    $data = [
        'title' => $title,
        'description' => 'Imported from image ' . $file,
        'start_at' => $startAt,
        'city' => null,
        'country' => null,
        'image' => $image,
        'image_thumbnail' => file_exists($dir . '/thumbnails/' . $thumbFile) ? $image_thumbnail : null,
        'user_id' => $user->id,
        'active' => true,
    ];

    $event = Event::create($data);
    echo "Created event {$event->id} for image {$file}\n";
    $count++;
    $days++;
}

echo "Imported $count images as events.\n";

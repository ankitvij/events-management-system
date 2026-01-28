<?php

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Event;
use App\Models\User;

$file = $argv[1] ?? 'BHwMP0S3UoUrtSfeTaxZzD1sXgu4IzSLRHMULGUL.jpg';
$dir = __DIR__.'/../storage/app/public/events';
$path = $dir . DIRECTORY_SEPARATOR . $file;

if (! is_file($path)) {
    echo "Image not found: {$path}\n";
    exit(1);
}

$email = 'ankitvijtech@gmail.com';
$user = User::where('email', $email)->first();
if (! $user) {
    echo "User {$email} not found.\n";
    exit(1);
}

$title = pathinfo($file, PATHINFO_FILENAME);
$title = str_replace(['-','_'], ' ', $title);
$title = ucwords($title);

$image = 'events/' . $file;
$ext = pathinfo($file, PATHINFO_EXTENSION);
$thumb = pathinfo($file, PATHINFO_FILENAME) . '-thumb.' . $ext;
$image_thumbnail = file_exists($dir . '/thumbnails/' . $thumb) ? 'events/thumbnails/' . $thumb : null;

$data = [
    'title' => $title,
    'description' => 'Duplicate import of image ' . $file,
    'start_at' => now()->addDays(10)->setTime(18,0),
    'image' => $image,
    'image_thumbnail' => $image_thumbnail,
    'user_id' => $user->id,
    'active' => true,
];

$event = Event::create($data);
echo "Created duplicate event {$event->id} for image {$file}\n";

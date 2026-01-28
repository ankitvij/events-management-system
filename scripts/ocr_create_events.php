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

function runTesseract(string $path): ?string
{
    $cmd = 'tesseract ' . escapeshellarg($path) . ' stdout -l eng --oem 1 --psm 6 2>&1';
    $out = shell_exec($cmd);
    if ($out === null) {
        return null;
    }
    // If tesseract isn't installed, the output often contains 'not found' or 'Tesseract'
    if (stripos($out, 'not found') !== false || stripos($out, 'unable to open display') !== false && stripos($out, 'tesseract') === false) {
        return null;
    }
    return $out;
}

function extractDate(string $text): ?\DateTime
{
    $patterns = [
        '/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/',
        '/\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/',
        '/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/i',
        '/\b(\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b/i',
    ];

    foreach ($patterns as $pat) {
        if (preg_match($pat, $text, $m)) {
            $candidate = $m[1] ?? $m[0];
            $d = date_create($candidate);
            if ($d !== false) {
                return $d;
            }
            $ts = strtotime($candidate);
            if ($ts !== false) {
                return (new DateTime())->setTimestamp($ts);
            }
        }
    }
    return null;
}

function extractTitle(array $lines, ?string $dateLine): string
{
    // prefer the longest line that isn't the date line and has letters
    $best = '';
    foreach ($lines as $line) {
        $s = trim($line);
        if ($s === '') continue;
        if ($dateLine && stripos($s, $dateLine) !== false) continue;
        if (! preg_match('/[A-Za-z]{2,}/', $s)) continue;
        if (mb_strlen($s) > mb_strlen($best)) {
            $best = $s;
        }
    }
    if ($best === '') {
        // fallback: first non-empty line
        foreach ($lines as $line) {
            $s = trim($line);
            if ($s !== '') return $s;
        }
    }
    return $best ?: 'Imported Event';
}

$files = scandir($dir);
$count = 0;

foreach ($files as $file) {
    if ($file === '.' || $file === '..' || $file === 'thumbnails') continue;

    $path = $dir . DIRECTORY_SEPARATOR . $file;
    if (! is_file($path)) continue;

    $ext = pathinfo($file, PATHINFO_EXTENSION);
    if (! in_array(strtolower($ext), ['jpg','jpeg','png','gif'])) continue;

    // skip if event already exists for this image
    if (Event::where('image', 'events/' . $file)->exists()) {
        echo "Skipping existing event for {$file}\n";
        continue;
    }

    $ocr = runTesseract($path);
    if ($ocr === null) {
        echo "Tesseract not available or failed for {$file}.\n";
        echo "Install Tesseract OCR or choose the Python/cloud option.\n";
        exit(1);
    }

    $lines = preg_split('/\r?\n/', $ocr);
    $date = extractDate($ocr);
    $dateLine = null;
    if ($date) {
        // find the line that contains the date snippet
        foreach ($lines as $ln) {
            if (preg_match('/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,1}|January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i', $ln)) {
                $dateLine = trim($ln);
                break;
            }
        }
    }

    $title = extractTitle($lines, $dateLine);

    $startAt = $date ? $date->setTime(18,0) : now()->addDays(7)->setTime(18,0);

    $image = 'events/' . $file;
    $thumbFile = pathinfo($file, PATHINFO_FILENAME) . '-thumb.' . $ext;
    $image_thumbnail = file_exists($dir . '/thumbnails/' . $thumbFile) ? 'events/thumbnails/' . $thumbFile : null;

    $data = [
        'title' => $title,
        'description' => 'Imported via OCR from image ' . $file,
        'start_at' => $startAt,
        'image' => $image,
        'image_thumbnail' => $image_thumbnail,
        'user_id' => $user->id,
        'active' => true,
    ];

    $event = Event::create($data);
    echo "Created event {$event->id} titled '{$title}' (date: " . ($date ? $date->format('Y-m-d') : 'none') . ") from {$file}\n";
    $count++;
}

echo "Imported $count images as events.\n";

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

function runTesseract(string $path, array $extra = []): ?string
{
    // Try several PSM modes and return the most 'textual' result
    $psmModes = $extra['psm'] ?? [6, 3, 11, 1];
    $best = null;
    $bestScore = -1;
    foreach ($psmModes as $psm) {
        $cmd = 'tesseract ' . escapeshellarg($path) . ' stdout -l eng --oem 1 --psm ' . (int) $psm . ' 2>&1';
        $out = shell_exec($cmd);
        if ($out === null) continue;
        // skip obvious errors
        if (stripos($out, 'not recognized') !== false || stripos($out, 'Error') !== false && stripos($out, 'Tesseract') === false) {
            continue;
        }
        // score by number of alphabetic chars
        $score = preg_match_all('/[A-Za-z]/', $out);
        if ($score > $bestScore) {
            $bestScore = $score;
            $best = $out;
        }
    }
    return $best;
}

function magickPreprocess(string $inputPath): ?string
{
    // Check if ImageMagick 'magick' is available
    $magick = trim(shell_exec('where magick 2>NUL')) ?: null;
    if (! $magick) {
        return null;
    }
    $tmp = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'ocr_pre_' . uniqid() . '.png';
    // simple preprocessing: grayscale, resize, sharpen, threshold
    $cmd = escapeshellarg($magick) . ' convert ' . escapeshellarg($inputPath) .
        ' -colorspace Gray -resize 200% -sharpen 0x1 -contrast-stretch 0 -threshold 60% ' . escapeshellarg($tmp) . ' 2>&1';
    shell_exec($cmd);
    if (is_file($tmp)) return $tmp;
    return null;
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
            if ($d !== false) return $d;
            $ts = strtotime($candidate);
            if ($ts !== false) return (new DateTime())->setTimestamp($ts);
        }
    }
    return null;
}

function extractTitle(array $lines, ?string $dateLine): string
{
    $best = '';
    foreach ($lines as $line) {
        $s = trim($line);
        if ($s === '') continue;
        if ($dateLine && stripos($s, $dateLine) !== false) continue;
        if (! preg_match('/[A-Za-z]{2,}/', $s)) continue;
        if (mb_strlen($s) > mb_strlen($best)) $best = $s;
    }
    if ($best === '') {
        foreach ($lines as $line) { if (trim($line) !== '') return trim($line); }
    }
    return $best ?: 'Imported Event';
}

function extractCity(array $lines): ?string
{
    // common heuristics: look for 'City: ' or 'Venue:' or 'in CITY' or 'CITY, COUNTRY'
    foreach ($lines as $line) {
        if (preg_match('/City[:\s]+([A-Za-z\s\-]+)/i', $line, $m)) return trim($m[1]);
        if (preg_match('/Venue[:\s]+([A-Za-z\s\-]+)/i', $line, $m)) return trim($m[1]);
        if (preg_match('/in\s+([A-Za-z\s\-]{2,30})/i', $line, $m)) return trim($m[1]);
        if (preg_match('/^([A-Za-z\s\-]{2,30}),\s*[A-Za-z\s\-]{2,30}$/', trim($line), $m)) return trim($m[1]);
    }
    // fallback: take a short capitalized line
    foreach ($lines as $line) {
        $s = trim($line);
        if (preg_match('/^[A-Z][a-z]+(\s+[A-Z][a-z]+)?$/', $s)) return $s;
    }
    return null;
}

$ocr = runTesseract($path);
if ($ocr === null) {
    echo "Tesseract failed or not installed.\n";
    exit(1);
}

$lines = preg_split('/\r?\n/', $ocr);
$date = extractDate($ocr);
$dateLine = null;
if ($date) {
    foreach ($lines as $ln) {
        if (preg_match('/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i', $ln)) {
            $dateLine = trim($ln);
            break;
        }
    }
}

$title = extractTitle($lines, $dateLine);
$city = extractCity($lines);

$imageField = 'events/' . $file;
$events = Event::where('image', $imageField)->get();
if ($events->isEmpty()) {
    echo "No events found using image {$imageField}\n";
    exit(0);
}

foreach ($events as $event) {
    $event->title = $title;
    if ($date) {
        $event->start_at = $date->setTime(18,0);
    }
    if ($city) $event->city = $city;
    $event->save();
    echo "Updated event {$event->id}: title='{$event->title}' date='" . ($event->start_at ? $event->start_at->format('Y-m-d') : 'none') . "' city='" . ($event->city ?? 'none') . "'\n";
}

echo "Done. Processed {$events->count()} events.\n";

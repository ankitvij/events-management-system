<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

$basePath = dirname(__DIR__);

$app = Application::configure(basePath: $basePath)
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();

// Determine which public folder to use based on environment/host.
// Priority: HTTP_HOST -> APP_URL host -> APP_ENV fallback -> filesystem check.
$detectedHost = $_SERVER['HTTP_HOST'] ?? null;
if (! $detectedHost) {
    $appUrl = env('APP_URL');
    if ($appUrl) {
        $detectedHost = parse_url($appUrl, PHP_URL_HOST) ?: null;
    }
}

$publicFolder = 'public'; // default for local development
if ($detectedHost) {
    $lower = strtolower($detectedHost);
    if (str_contains($lower, 'chancepass.com')) {
        $publicFolder = 'public_html';
    } elseif (str_contains($lower, 'events.test')) {
        // Use public_html locally so Herd's webroot and Laravel match
        $publicFolder = 'public_html';
    } elseif (str_contains($lower, 'hostingersite.com')) {
        $publicFolder = 'public_html';
    }
} else {
    // No host detected (CLI). Use APP_ENV or presence of public_html as indicators.
    if (env('APP_ENV') === 'production' && is_dir($basePath.DIRECTORY_SEPARATOR.'public_html')) {
        $publicFolder = 'public_html';
    } elseif (is_dir($basePath.DIRECTORY_SEPARATOR.'public_html') && ! is_dir($basePath.DIRECTORY_SEPARATOR.'public')) {
        // If public does not exist but public_html does, prefer public_html.
        $publicFolder = 'public_html';
    }
}

// If a host was detected but we still defaulted to public, prefer public_html when it exists.
if ($publicFolder === 'public' && is_dir($basePath.DIRECTORY_SEPARATOR.'public_html')) {
    $publicFolder = 'public_html';
}

$app->usePublicPath($basePath.DIRECTORY_SEPARATOR.$publicFolder);

return $app;

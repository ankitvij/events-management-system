<?php

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

$bootstrapClasses = [
    Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables::class,
    Illuminate\Foundation\Bootstrap\LoadConfiguration::class,
    Illuminate\Foundation\Bootstrap\RegisterFacades::class,
    Illuminate\Foundation\Bootstrap\RegisterProviders::class,
    Illuminate\Foundation\Bootstrap\BootProviders::class,
];

foreach ($bootstrapClasses as $class) {
    (new $class)->bootstrap($app);
}

$events = \App\Models\Event::whereNotNull('image')->limit(50)->get();
if ($events->isEmpty()) {
    echo "NONE\n";
    exit(0);
}

foreach ($events as $e) {
    echo $e->id.':'.$e->image.PHP_EOL;
}

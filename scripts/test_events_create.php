<?php

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Bootstrap the framework so models, config and providers are available
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

// Resolve user and attach to request user resolver so auth() sees it
$user = \App\Models\User::find(1);

$request = Illuminate\Http\Request::create('/events/create', 'GET');
$request->setUserResolver(function () use ($user) {
    return $user;
});

// Bind the request into the container so URL generation and facades work
$app->instance('request', $request);

$controller = new \App\Http\Controllers\EventController;
$resp = $controller->create();

echo 'RESPONSE_CLASS:'.get_class($resp).PHP_EOL;

// If it's an Inertia response, convert to HTTP response for content
if (is_object($resp) && method_exists($resp, 'toResponse')) {
    $http = $resp->toResponse($request);
    echo 'STATUS:'.$http->getStatusCode().PHP_EOL;
    echo "CONTENT_SNIPPET_START\n";
    echo substr((string) $http->getContent(), 0, 2000).PHP_EOL;
    echo "\nCONTENT_SNIPPET_END\n";
} else {
    // Fallback: string cast
    echo 'STATUS:200'.PHP_EOL;
    echo "CONTENT_SNIPPET_START\n";
    echo substr((string) $resp, 0, 2000).PHP_EOL;
    echo "\nCONTENT_SNIPPET_END\n";
}

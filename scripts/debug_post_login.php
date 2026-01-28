<?php

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$bootstrap = [
    Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables::class,
    Illuminate\Foundation\Bootstrap\LoadConfiguration::class,
    Illuminate\Foundation\Bootstrap\RegisterFacades::class,
    Illuminate\Foundation\Bootstrap\RegisterProviders::class,
    Illuminate\Foundation\Bootstrap\BootProviders::class,
];

foreach ($bootstrap as $b) {
    (new $b)->bootstrap($app);
}

// ensure session driver is array for this script
$app->make('config')->set('session.driver', 'array');

// create a test user
$u = \App\Models\User::factory()->create(['email' => 'debug@example.com']);

$request = Illuminate\Http\Request::create('/login', 'POST', [
    'email' => $u->email,
    'password' => 'password',
]);

// bind request
$app->instance('request', $request);

$response = $kernel->handle($request);

echo 'STATUS:'.$response->getStatusCode().PHP_EOL;
echo "HEADERS:\n";
foreach ($response->headers->all() as $k => $v) {
    echo $k.': '.implode(',', $v).PHP_EOL;
}

echo "\nCONTENT_SNIPPET:\n";
echo substr((string) $response->getContent(), 0, 2000).PHP_EOL;

$kernel->terminate($request, $response);

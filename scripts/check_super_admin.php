<?php

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$email = 'ankitvijtech@gmail.com';
$user = User::where('email', $email)->first();
if (! $user) {
    echo "No user with email {$email}\n";
    exit(0);
}

echo "User: {$user->id} {$user->email} is_super_admin=".($user->is_super_admin ? '1' : '0')."\n";

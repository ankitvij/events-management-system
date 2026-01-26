<?php

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$email = 'ankitvijtech@gmail.com';

$user = User::where('email', $email)->first();
if (! $user) {
    $user = User::create([
        'name' => 'Ankit',
        'email' => $email,
        'password' => 'password',
        'is_super_admin' => true,
    ]);
    echo "Created user Ankit ({$user->id}) and marked as super admin\n";
} else {
    $user->is_super_admin = true;
    $user->save();
    echo "Marked existing user ({$user->id}) as super admin\n";
}

echo "Done.\n";

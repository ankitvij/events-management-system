<?php

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$u = User::where('email', 'ankitvijtech@gmail.com')->first();
if (! $u) {
    echo "NOT_FOUND\n";
    exit(1);
}

echo json_encode([
    'id' => $u->id,
    'email' => $u->email,
    'name' => $u->name,
    'is_super_admin' => (bool) $u->is_super_admin,
    'role' => $u->role,
]).PHP_EOL;

echo (Hash::check('password', $u->password) ? 'PASSWORD_OK' : 'PASSWORD_FAIL').PHP_EOL;

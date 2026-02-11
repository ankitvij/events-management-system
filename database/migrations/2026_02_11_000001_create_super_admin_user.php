<?php

use App\Enums\Role;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        $email = 'superadmin@chancepass.com';

        $existing = DB::table('users')->where('email', $email)->first();

        if ($existing === null) {
            DB::table('users')->insert([
                'name' => 'Super Admin',
                'email' => $email,
                'password' => Hash::make('ChangeMeNow!123'),
                'is_super_admin' => true,
                'role' => Role::SUPER_ADMIN->value,
                'active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return;
        }

        DB::table('users')
            ->where('email', $email)
            ->update([
                'is_super_admin' => true,
                'role' => Role::SUPER_ADMIN->value,
                'active' => true,
                'email_verified_at' => now(),
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        $email = 'superadmin@chancepass.com';

        DB::table('users')->where('email', $email)->delete();
    }
};

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class EnsureSuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'super@example.test'],
            [
                'name' => 'Super Admin',
                'role' => 'super_admin',
                'is_super_admin' => true,
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
    }
}

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EnsureSuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn('Skipping EnsureSuperAdminSeeder in production environment.');

            return;
        }

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

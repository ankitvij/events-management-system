<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUsersSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn('Skipping AdminUsersSeeder in production environment.');

            return;
        }

        // Create three admin users if they don't exist
        $admins = [
            ['name' => 'Admin One', 'email' => 'admin1@example.com'],
            ['name' => 'Admin Two', 'email' => 'admin2@example.com'],
            ['name' => 'Admin Three', 'email' => 'admin3@example.com'],
        ];

        foreach ($admins as $a) {
            User::firstOrCreate([
                'email' => $a['email'],
            ], [
                'name' => $a['name'],
                'password' => bcrypt('password'),
                'role' => 'admin',
                'is_super_admin' => false,
                'email_verified_at' => now(),
            ]);
        }
    }
}

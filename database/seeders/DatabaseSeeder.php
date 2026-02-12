<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Never seed demo/sample data on production.
        if (app()->environment('production')) {
            return;
        }

        // Ensure the test user exists without creating duplicates
        \App\Models\User::updateOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User', 'password' => bcrypt('password')]
        );

        // Create sample events
        $this->call(EventsTableSeeder::class);
        // Populate cities and countries for existing events
        $this->call(EventsCityCountrySeeder::class);
        // Create sample organisers and customers
        $this->call(CustomersOrganisersSeeder::class);
        // Add latest curated events
        $this->call(LatestEventsSeeder::class);

        // Add comprehensive linked sample data only when explicitly enabled.
        if (config('seeding.allow_sample_data')) {
            $this->call(EverythingSampleSeeder::class);
        }
    }
}

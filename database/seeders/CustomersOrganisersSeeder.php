<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Organiser;
use Illuminate\Database\Seeder;

class CustomersOrganisersSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn('Skipping CustomersOrganisersSeeder in production environment.');

            return;
        }

        // Create 5 organisers
        for ($i = 1; $i <= 5; $i++) {
            $name = 'Organiser '.$i;
            Organiser::firstOrCreate([
                'email' => 'organiser'.$i.'@example.test',
            ], [
                'name' => $name,
                'active' => true,
            ]);
        }

        // Create 10 customers
        for ($i = 1; $i <= 10; $i++) {
            Customer::firstOrCreate([
                'email' => 'customer'.$i.'@example.test',
            ], [
                'name' => 'Customer '.$i,
                'phone' => null,
                'active' => true,
            ]);
        }
    }
}

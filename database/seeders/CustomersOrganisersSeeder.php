<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Organiser;
use Illuminate\Database\Seeder;

class CustomersOrganisersSeeder extends Seeder
{
    public function run(): void
    {
        $faker = \Faker\Factory::create();

        // Create 5 organisers
        for ($i = 1; $i <= 5; $i++) {
            $name = $faker->company . ' ' . $i;
            Organiser::firstOrCreate([
                'email' => $faker->unique()->companyEmail,
            ], [
                'name' => $name,
                'active' => $faker->boolean(90),
            ]);
        }

        // Create 10 customers
        for ($i = 1; $i <= 10; $i++) {
            Customer::firstOrCreate([
                'email' => $faker->unique()->safeEmail,
            ], [
                'name' => $faker->name,
                'phone' => $faker->optional()->phoneNumber,
                'active' => $faker->boolean(90),
            ]);
        }
    }
}

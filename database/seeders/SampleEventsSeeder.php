<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;

class SampleEventsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = ['Party', 'Festival', 'Concert', 'Rave', 'Carnival', 'Gala', 'Meetup', 'Expo'];
        $cities = ['London', 'Paris', 'Berlin', 'Madrid', 'New York', 'Los Angeles', 'Sydney', 'Toronto'];
        $countries = ['United Kingdom', 'France', 'Germany', 'Spain', 'USA', 'Australia', 'Canada'];

        for ($i = 0; $i < 40; $i++) {
            $type = $types[array_rand($types)];
            $city = $cities[array_rand($cities)];
            $country = $countries[array_rand($countries)];

            Event::factory()->create([
                'title' => $type.' — '.ucfirst(\Illuminate\Support\Str::random(6)),
                'location' => $city,
                'city' => $city,
                'country' => $country,
            ]);
        }
    }
}

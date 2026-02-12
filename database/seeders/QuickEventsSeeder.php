<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Organiser;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class QuickEventsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn('Skipping QuickEventsSeeder in production environment.');

            return;
        }

        $faker = class_exists('Faker\\Factory') ? \Faker\Factory::create() : null;

        $user = User::query()->first();
        if (! $user) {
            $user = User::factory()->create([
                'name' => 'Seeder User',
                'email' => 'seeder@example.test',
                'role' => 'admin',
                'is_super_admin' => false,
            ]);
        }

        $organisers = collect();
        for ($i = 1; $i <= 5; $i++) {
            $organisers->push(Organiser::create([
                'name' => "Quick Organiser {$i}",
                'email' => "quick.organiser{$i}@example.test",
                'active' => true,
            ]));
        }

        $locations = [
            ['city' => 'London', 'country' => 'United Kingdom', 'address' => 'King Street, London'],
            ['city' => 'Paris', 'country' => 'France', 'address' => 'Rue de Rivoli, Paris'],
            ['city' => 'Berlin', 'country' => 'Germany', 'address' => 'Alexanderplatz, Berlin'],
            ['city' => 'Madrid', 'country' => 'Spain', 'address' => 'Gran Via, Madrid'],
            ['city' => 'New York', 'country' => 'USA', 'address' => 'Broadway, New York'],
            ['city' => 'Los Angeles', 'country' => 'USA', 'address' => 'Sunset Blvd, Los Angeles'],
            ['city' => 'Toronto', 'country' => 'Canada', 'address' => 'Queen Street, Toronto'],
            ['city' => 'Sydney', 'country' => 'Australia', 'address' => 'George Street, Sydney'],
            ['city' => 'Dublin', 'country' => 'Ireland', 'address' => 'OConnell Street, Dublin'],
            ['city' => 'Chicago', 'country' => 'USA', 'address' => 'Michigan Avenue, Chicago'],
        ];

        $types = [
            'Festival',
            'Conference',
            'Concert',
            'Meetup',
            'Workshop',
            'Expo',
            'Summit',
            'Showcase',
        ];

        for ($i = 1; $i <= 20; $i++) {
            $location = $locations[array_rand($locations)];
            $type = $types[array_rand($types)];
            $start = now()->addDays($faker ? $faker->numberBetween(3, 90) : random_int(3, 90))->setTime(18, 0);
            $end = $start->copy()->addDays($faker ? $faker->numberBetween(1, 4) : random_int(1, 4))->setTime(22, 0);
            $title = $type.' '.$location['city'].' Edition '.($faker ? $faker->numberBetween(1, 99) : random_int(1, 99));
            $organiser = $organisers->random();

            $event = Event::create([
                'title' => $title,
                'description' => $faker ? $faker->paragraphs(2, true) : 'Sample quick event description.',
                'start_at' => $start,
                'end_at' => $end,
                'city' => $location['city'],
                'address' => $location['address'],
                'country' => $location['country'],
                'slug' => Str::slug($title).'-'.Str::lower(Str::random(6)),
                'user_id' => $user->id,
                'active' => true,
                'organiser_id' => $organiser->id,
            ]);

            $event->organisers()->syncWithoutDetaching([$organiser->id]);

            $event->tickets()->createMany([
                [
                    'name' => 'General Admission',
                    'price' => 15.00,
                    'quantity_total' => 120,
                    'quantity_available' => 120,
                    'active' => true,
                ],
                [
                    'name' => 'VIP',
                    'price' => 45.00,
                    'quantity_total' => 30,
                    'quantity_available' => 30,
                    'active' => true,
                ],
            ]);
        }
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use Illuminate\Support\Str;

class LatestEventsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $events = [
            ['title' => 'ChancePass Launch Party', 'city' => 'Berlin', 'country' => 'Germany', 'start_at' => '2026-02-15 18:00:00'],
            ['title' => 'Spring Coding Retreat', 'city' => 'Lisbon', 'country' => 'Portugal', 'start_at' => '2026-03-10 09:00:00'],
            ['title' => 'Open Data Summit', 'city' => 'Amsterdam', 'country' => 'Netherlands', 'start_at' => '2026-04-05 10:00:00'],
            ['title' => 'Developers Meetup', 'city' => 'Madrid', 'country' => 'Spain', 'start_at' => '2026-04-20 18:30:00'],
            ['title' => 'UX Workshop', 'city' => 'Dublin', 'country' => 'Ireland', 'start_at' => '2026-05-02 14:00:00'],
            ['title' => 'AI & Society Forum', 'city' => 'Paris', 'country' => 'France', 'start_at' => '2026-05-20 09:30:00'],
            ['title' => 'Community Hackday', 'city' => 'Berlin', 'country' => 'Germany', 'start_at' => '2026-06-12 11:00:00'],
            ['title' => 'Summer Social', 'city' => 'Barcelona', 'country' => 'Spain', 'start_at' => '2026-06-25 17:00:00'],
            ['title' => 'Remote Work Conference', 'city' => 'Stockholm', 'country' => 'Sweden', 'start_at' => '2026-07-08 09:00:00'],
            ['title' => 'Product Design Day', 'city' => 'London', 'country' => 'United Kingdom', 'start_at' => '2026-07-22 10:00:00'],
        ];

        foreach ($events as $e) {
            Event::updateOrCreate(
                ['slug' => Str::slug($e['title'])],
                [
                    'title' => $e['title'],
                    'city' => $e['city'],
                    'country' => $e['country'],
                    'start_at' => $e['start_at'],
                    'is_public' => true,
                ]
            );
        }
    }
}

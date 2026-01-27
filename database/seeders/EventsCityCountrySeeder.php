<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;

class EventsCityCountrySeeder extends Seeder
{
    public function run(): void
    {
        $choices = [
            ['city' => 'New York', 'country' => 'USA'],
            ['city' => 'London', 'country' => 'UK'],
            ['city' => 'Berlin', 'country' => 'Germany'],
            ['city' => 'Paris', 'country' => 'France'],
            ['city' => 'Sydney', 'country' => 'Australia'],
            ['city' => 'Toronto', 'country' => 'Canada'],
            ['city' => 'Mumbai', 'country' => 'India'],
            ['city' => 'Singapore', 'country' => 'Singapore'],
        ];

        Event::whereNull('city')->orWhereNull('country')->get()->each(function (Event $event) use ($choices) {
            $pick = $choices[array_rand($choices)];
            $event->city = $event->city ?: $pick['city'];
            $event->country = $event->country ?: $pick['country'];
            $event->save();
        });
    }
}

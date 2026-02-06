<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        $faker = \Faker\Factory::create();
        $start = $faker->dateTimeBetween('now', '+1 month');
        $end = (clone $start)->modify('+'.$faker->numberBetween(1, 5).' days');

        return [
            'title' => $faker->sentence(6),
            'description' => $faker->paragraph(),
            'start_at' => $start->format('Y-m-d'),
            'end_at' => $end->format('Y-m-d'),
            'user_id' => User::factory(),
        ];
    }
}

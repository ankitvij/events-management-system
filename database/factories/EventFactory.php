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
        $start = $this->faker->dateTimeBetween('now', '+1 month');
        $end = (clone $start)->modify('+'. $this->faker->numberBetween(1,48) .' hours');

        return [
            'title' => $this->faker->sentence(6),
            'description' => $this->faker->paragraph(),
            'start_at' => $start,
            'end_at' => $end,
            'location' => $this->faker->city(),
            'user_id' => User::factory(),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        $start = now()->addDays(random_int(1, 30));
        $end = (clone $start)->addDays(random_int(1, 5));
        $title = $this->randomTitle();

        return [
            'title' => $title,
            'description' => 'Sample event description for '.$title.'.',
            'start_at' => $start->format('Y-m-d'),
            'end_at' => $end->format('Y-m-d'),
            'slug' => Str::slug($title).'-'.Str::random(6),
            'user_id' => User::factory(),
        ];
    }

    private function randomTitle(): string
    {
        $topics = ['Festival', 'Concert', 'Meetup', 'Workshop', 'Conference', 'Showcase'];

        return $topics[array_rand($topics)].' '.Str::upper(Str::random(5));
    }
}

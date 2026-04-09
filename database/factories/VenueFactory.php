<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Venue>
 */
class VenueFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Venue '.Str::upper(Str::random(6)),
            'email' => 'venue_'.Str::lower(Str::random(12)).'@example.test',
            'city' => 'City '.Str::upper(Str::random(4)),
            'description' => 'Sample venue description.',
            'active' => true,
        ];
    }
}

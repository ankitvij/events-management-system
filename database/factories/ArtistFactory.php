<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Artist>
 */
class ArtistFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'city' => fake()->city(),
            'experience_years' => fake()->numberBetween(0, 40),
            'skills' => implode(', ', fake()->words(5)),
            'artist_types' => ['performer'],
            'description' => fake()->paragraph(),
            'equipment' => implode(', ', fake()->words(6)),
            'photo' => 'artists/fake.jpg',
            'active' => true,
            'email_verified_at' => now(),
            'verify_token' => null,
        ];
    }
}

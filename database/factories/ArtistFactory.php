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
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'city' => $this->faker->city(),
            'experience_years' => $this->faker->numberBetween(0, 40),
            'skills' => implode(', ', $this->faker->words(5)),
            'artist_types' => ['performer'],
            'description' => $this->faker->paragraph(),
            'equipment' => implode(', ', $this->faker->words(6)),
            'photo' => 'artists/fake.jpg',
            'active' => true,
            'email_verified_at' => now(),
            'verify_token' => null,
        ];
    }
}

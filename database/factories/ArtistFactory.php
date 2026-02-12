<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Throwable;

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
            'name' => $this->generateName(),
            'email' => $this->generateEmail(),
            'city' => $this->generateCity(),
            'experience_years' => $this->generateExperienceYears(),
            'skills' => implode(', ', $this->generateWords(5)),
            'artist_types' => ['performer'],
            'description' => $this->generateDescription(),
            'equipment' => implode(', ', $this->generateWords(6)),
            'photo' => 'artists/fake.jpg',
            'active' => true,
            'email_verified_at' => now(),
            'verify_token' => null,
        ];
    }

    private function generateName(): string
    {
        try {
            if ($this->faker !== null) {
                return $this->faker->name();
            }
        } catch (Throwable) {
        }

        return 'Artist '.Str::upper(Str::random(6));
    }

    private function generateEmail(): string
    {
        try {
            if ($this->faker !== null) {
                return $this->faker->unique()->safeEmail();
            }
        } catch (Throwable) {
        }

        return 'artist_'.Str::lower(Str::random(12)).'@example.test';
    }

    private function generateCity(): string
    {
        try {
            if ($this->faker !== null) {
                return $this->faker->city();
            }
        } catch (Throwable) {
        }

        return 'City '.Str::upper(Str::random(4));
    }

    private function generateExperienceYears(): int
    {
        try {
            if ($this->faker !== null) {
                return $this->faker->numberBetween(0, 40);
            }
        } catch (Throwable) {
        }

        return random_int(0, 40);
    }

    /**
     * @return array<int, string>
     */
    private function generateWords(int $count): array
    {
        try {
            if ($this->faker !== null) {
                return $this->faker->words($count);
            }
        } catch (Throwable) {
        }

        $words = [];
        for ($index = 0; $index < $count; $index++) {
            $words[] = Str::lower(Str::random(6));
        }

        return $words;
    }

    private function generateDescription(): string
    {
        try {
            if ($this->faker !== null) {
                return $this->faker->paragraph();
            }
        } catch (Throwable) {
        }

        return 'Sample artist profile description.';
    }
}

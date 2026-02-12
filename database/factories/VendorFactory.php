<?php

namespace Database\Factories;

use App\Enums\VendorType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vendor>
 */
class VendorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'email' => fake()->unique()->safeEmail(),
            'type' => fake()->randomElement(VendorType::values()),
            'city' => fake()->city(),
            'description' => fake()->sentence(),
            'active' => true,
        ];
    }
}

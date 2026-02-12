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
            'name' => $this->faker->company(),
            'email' => $this->faker->unique()->safeEmail(),
            'type' => $this->faker->randomElement(VendorType::values()),
            'city' => $this->faker->city(),
            'description' => $this->faker->sentence(),
            'active' => true,
        ];
    }
}

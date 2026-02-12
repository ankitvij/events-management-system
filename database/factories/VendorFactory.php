<?php

namespace Database\Factories;

use App\Enums\VendorType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Throwable;

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
            'name' => $this->generateCompanyName(),
            'email' => $this->generateEmail(),
            'type' => $this->generateVendorType(),
            'city' => $this->generateCity(),
            'description' => $this->generateDescription(),
            'active' => true,
        ];
    }

    private function generateCompanyName(): string
    {
        try {
            if ($this->faker !== null) {
                return $this->faker->company();
            }
        } catch (Throwable) {
        }

        return 'Vendor '.Str::upper(Str::random(6));
    }

    private function generateEmail(): string
    {
        try {
            if ($this->faker !== null) {
                return $this->faker->unique()->safeEmail();
            }
        } catch (Throwable) {
        }

        return 'vendor_'.Str::lower(Str::random(12)).'@example.test';
    }

    private function generateVendorType(): string
    {
        $values = VendorType::values();

        try {
            if ($this->faker !== null) {
                return $this->faker->randomElement($values);
            }
        } catch (Throwable) {
        }

        return $values[array_rand($values)];
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

    private function generateDescription(): string
    {
        try {
            if ($this->faker !== null) {
                return $this->faker->sentence();
            }
        } catch (Throwable) {
        }

        return 'Sample vendor description.';
    }
}

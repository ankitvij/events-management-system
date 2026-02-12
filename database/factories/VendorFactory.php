<?php

namespace Database\Factories;

use App\Enums\VendorType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

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
        return 'Vendor '.Str::upper(Str::random(6));
    }

    private function generateEmail(): string
    {
        return 'vendor_'.Str::lower(Str::random(12)).'@example.test';
    }

    private function generateVendorType(): string
    {
        $values = VendorType::values();

        return $values[array_rand($values)];
    }

    private function generateCity(): string
    {
        return 'City '.Str::upper(Str::random(4));
    }

    private function generateDescription(): string
    {
        return 'Sample vendor description.';
    }
}

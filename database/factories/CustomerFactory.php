<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Throwable;

class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        return [
            'name' => $this->generateName(),
            'email' => $this->generateEmail(),
            'phone' => $this->generatePhone(),
            'active' => true,
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

        return 'Customer '.Str::upper(Str::random(6));
    }

    private function generateEmail(): string
    {
        try {
            if ($this->faker !== null) {
                return $this->faker->unique()->safeEmail();
            }
        } catch (Throwable) {
        }

        return 'customer_'.Str::lower(Str::random(12)).'@example.test';
    }

    private function generatePhone(): ?string
    {
        try {
            if ($this->faker !== null) {
                return $this->faker->optional()->phoneNumber();
            }
        } catch (Throwable) {
        }

        return null;
    }
}

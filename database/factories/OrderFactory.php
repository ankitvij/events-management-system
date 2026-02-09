<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'booking_code' => $this->faker->unique()->regexify('[A-Z0-9]{10}'),
            'status' => 'confirmed',
            'total' => $this->faker->randomFloat(2, 10, 100),
            'contact_name' => $this->faker->name(),
            'contact_email' => $this->faker->safeEmail(),
        ];
    }
}

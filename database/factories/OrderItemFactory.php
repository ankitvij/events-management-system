<?php

namespace Database\Factories;

use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        return [
            'order_id' => null,
            'ticket_id' => null,
            'event_id' => null,
            'quantity' => 1,
            'price' => $this->faker->randomFloat(2, 10, 100),
            'guest_details' => [
                ['name' => $this->faker->name(), 'email' => $this->faker->safeEmail()],
            ],
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

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
            'price' => round(10 + (mt_rand() / mt_getrandmax()) * 90, 2),
            'guest_details' => [
                [
                    'name' => 'Guest '.Str::upper(Str::random(5)),
                    'email' => 'guest_'.Str::lower(Str::random(10)).'@example.test',
                ],
            ],
        ];
    }
}

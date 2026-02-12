<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'booking_code' => Str::upper(Str::random(10)),
            'status' => 'confirmed',
            'total' => round(10 + (mt_rand() / mt_getrandmax()) * 90, 2),
            'contact_name' => 'Contact '.Str::upper(Str::random(5)),
            'contact_email' => 'contact_'.Str::lower(Str::random(10)).'@example.test',
        ];
    }
}

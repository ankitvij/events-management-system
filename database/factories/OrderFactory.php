<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    protected function makeBookingCode(): string
    {
        $letters = preg_replace('/[^A-Z]/', 'A', Str::upper(Str::random(6)) ?? 'AAAAAA');
        $digits = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);

        return Str::upper(str_shuffle($letters.$digits));
    }

    public function definition(): array
    {
        return [
            'booking_code' => $this->makeBookingCode(),
            'status' => 'confirmed',
            'total' => round(10 + (mt_rand() / mt_getrandmax()) * 90, 2),
            'contact_name' => 'Contact '.Str::upper(Str::random(5)),
            'contact_email' => 'contact_'.Str::lower(Str::random(10)).'@example.test',
        ];
    }
}

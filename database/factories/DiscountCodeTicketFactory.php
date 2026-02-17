<?php

namespace Database\Factories;

use App\Models\DiscountCode;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DiscountCodeTicket>
 */
class DiscountCodeTicketFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'discount_code_id' => DiscountCode::factory(),
            'event_id' => 1,
            'ticket_id' => 1,
            'discount_type' => $this->faker->randomElement(['euro', 'percentage']),
            'discount_value' => 10,
        ];
    }
}

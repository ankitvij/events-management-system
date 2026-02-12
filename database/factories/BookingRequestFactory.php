<?php

namespace Database\Factories;

use App\Models\Artist;
use App\Models\BookingRequest;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BookingRequest>
 */
class BookingRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'artist_id' => Artist::factory(),
            'requested_by_user_id' => User::factory(),
            'status' => BookingRequest::STATUS_PENDING,
            'message' => $this->faker->sentence(),
            'responded_at' => null,
        ];
    }
}

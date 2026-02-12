<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorBookingRequest;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VendorBookingRequest>
 */
class VendorBookingRequestFactory extends Factory
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
            'vendor_id' => Vendor::factory(),
            'requested_by_user_id' => User::factory(),
            'status' => VendorBookingRequest::STATUS_PENDING,
            'message' => 'Vendor booking request '.Str::lower(Str::random(8)),
            'responded_at' => null,
        ];
    }
}

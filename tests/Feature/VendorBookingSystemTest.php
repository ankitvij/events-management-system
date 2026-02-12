<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorBookingRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class VendorBookingSystemTest extends TestCase
{
    use RefreshDatabase;

    public function test_vendor_can_manage_calendar_dates(): void
    {
        $vendor = Vendor::factory()->create([
            'active' => true,
        ]);

        $this->withSession(['vendor_id' => $vendor->id]);

        $post = $this->post(route('vendor.calendar.store'), [
            'date' => now()->addDays(3)->toDateString(),
            'is_available' => true,
        ]);

        $post->assertRedirect();

        $get = $this->get(route('vendor.calendar'));
        $get->assertStatus(200);
        $get->assertJsonFragment(['vendor_id' => $vendor->id]);
    }

    public function test_organiser_can_send_vendor_booking_request_and_vendor_can_accept_and_become_visible_on_event(): void
    {
        Mail::fake();

        $owner = User::factory()->create(['role' => 'admin', 'is_super_admin' => false]);
        $this->actingAs($owner);

        $event = Event::factory()->create([
            'user_id' => $owner->id,
            'active' => true,
        ]);

        $vendor = Vendor::factory()->create([
            'active' => true,
        ]);

        $send = $this->post(route('events.vendor-booking-requests.store', $event), [
            'vendor_id' => $vendor->id,
            'message' => 'Can you support this event?',
        ]);

        $send->assertRedirect();

        $booking = VendorBookingRequest::query()
            ->where('event_id', $event->id)
            ->where('vendor_id', $vendor->id)
            ->firstOrFail();

        $this->assertSame(VendorBookingRequest::STATUS_PENDING, $booking->status);

        $this->withSession(['vendor_id' => $vendor->id]);

        $accept = $this->post(route('vendor.bookings.accept', $booking));
        $accept->assertRedirect();

        $booking->refresh();
        $this->assertSame(VendorBookingRequest::STATUS_ACCEPTED, $booking->status);

        $this->assertDatabaseHas('vendor_event', [
            'event_id' => $event->id,
            'vendor_id' => $vendor->id,
            'vendor_booking_request_id' => $booking->id,
        ]);

        $show = $this->get(route('events.show', $event));
        $show->assertStatus(200);
        $show->assertJsonFragment(['name' => $vendor->name]);
    }

    public function test_vendor_can_decline_vendor_booking_request(): void
    {
        Mail::fake();

        $owner = User::factory()->create(['role' => 'admin', 'is_super_admin' => false]);
        $this->actingAs($owner);

        $event = Event::factory()->create([
            'user_id' => $owner->id,
            'active' => true,
        ]);

        $vendor = Vendor::factory()->create([
            'active' => true,
        ]);

        $this->post(route('events.vendor-booking-requests.store', $event), [
            'vendor_id' => $vendor->id,
        ])->assertRedirect();

        $booking = VendorBookingRequest::query()
            ->where('event_id', $event->id)
            ->where('vendor_id', $vendor->id)
            ->firstOrFail();

        $this->withSession(['vendor_id' => $vendor->id]);

        $decline = $this->post(route('vendor.bookings.decline', $booking));
        $decline->assertRedirect();

        $booking->refresh();
        $this->assertSame(VendorBookingRequest::STATUS_DECLINED, $booking->status);

        $this->assertDatabaseMissing('vendor_event', [
            'event_id' => $event->id,
            'vendor_id' => $vendor->id,
        ]);
    }
}

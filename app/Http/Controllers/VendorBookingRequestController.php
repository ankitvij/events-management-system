<?php

namespace App\Http\Controllers;

use App\Http\Middleware\EnsureVendorAuthenticated;
use App\Http\Requests\StoreVendorBookingRequestRequest;
use App\Mail\LoginTokenMail;
use App\Models\Event;
use App\Models\LoginToken;
use App\Models\Vendor;
use App\Models\VendorBookingRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class VendorBookingRequestController extends Controller
{
    public function __construct()
    {
        $this->middleware(EnsureVendorAuthenticated::class)->only(['index', 'accept', 'decline']);
    }

    public function store(StoreVendorBookingRequestRequest $request, Event $event): RedirectResponse
    {
        $current = $request->user();
        if (! $current) {
            abort(403);
        }

        if (! ($current->is_super_admin || ($event->user_id && $event->user_id === $current->id))) {
            abort(403);
        }

        $data = $request->validated();

        $vendor = Vendor::query()->findOrFail((int) $data['vendor_id']);
        if (! $vendor->active) {
            return redirect()->back()->with('error', 'That vendor account is not active.');
        }

        $booking = VendorBookingRequest::query()->create([
            'event_id' => $event->id,
            'vendor_id' => $vendor->id,
            'requested_by_user_id' => $current->id,
            'status' => VendorBookingRequest::STATUS_PENDING,
            'message' => $data['message'] ?? null,
        ]);

        $plain = Str::random(64);
        $hash = hash('sha256', $plain);

        LoginToken::query()
            ->where('type', 'vendor')
            ->where('vendor_id', $vendor->id)
            ->delete();

        LoginToken::query()->create([
            'email' => $vendor->email,
            'token_hash' => $hash,
            'type' => 'vendor',
            'vendor_id' => $vendor->id,
            'expires_at' => now()->addMinutes(30),
        ]);

        $url = route('vendors.login.token.consume', ['token' => $plain]);
        $subject = 'New vendor booking request';
        $intro = "You have a new vendor booking request for the event: {$event->title}. Sign in to accept or decline.";
        Mail::to($vendor->email)->send(new LoginTokenMail($url, $subject, $intro));

        return redirect()->back()->with('success', 'Vendor booking request sent.');
    }

    public function index(Request $request)
    {
        $vendorId = (int) $request->session()->get('vendor_id');
        $vendor = Vendor::query()->findOrFail($vendorId);

        $bookingRequests = VendorBookingRequest::query()
            ->with(['event', 'requestedBy'])
            ->where('vendor_id', $vendor->id)
            ->orderByDesc('created_at')
            ->get();

        if ($request->expectsJson() || app()->runningUnitTests()) {
            return response()->json([
                'vendor' => $vendor,
                'bookingRequests' => $bookingRequests,
            ]);
        }

        return Inertia::render('Vendor/Bookings', [
            'vendor' => $vendor,
            'bookingRequests' => $bookingRequests,
        ]);
    }

    public function accept(Request $request, VendorBookingRequest $vendorBookingRequest): RedirectResponse
    {
        $vendorId = (int) $request->session()->get('vendor_id');
        if ((int) $vendorBookingRequest->vendor_id !== $vendorId) {
            abort(403);
        }

        if ($vendorBookingRequest->status !== VendorBookingRequest::STATUS_PENDING) {
            return redirect()->back();
        }

        $vendorBookingRequest->update([
            'status' => VendorBookingRequest::STATUS_ACCEPTED,
            'responded_at' => now(),
        ]);

        $event = Event::query()->findOrFail($vendorBookingRequest->event_id);

        $event->vendors()->syncWithoutDetaching([
            $vendorId => ['vendor_booking_request_id' => $vendorBookingRequest->id],
        ]);

        $event->vendors()->updateExistingPivot($vendorId, [
            'vendor_booking_request_id' => $vendorBookingRequest->id,
        ]);

        return redirect()->back()->with('success', 'Booking request accepted.');
    }

    public function decline(Request $request, VendorBookingRequest $vendorBookingRequest): RedirectResponse
    {
        $vendorId = (int) $request->session()->get('vendor_id');
        if ((int) $vendorBookingRequest->vendor_id !== $vendorId) {
            abort(403);
        }

        if ($vendorBookingRequest->status !== VendorBookingRequest::STATUS_PENDING) {
            return redirect()->back();
        }

        $vendorBookingRequest->update([
            'status' => VendorBookingRequest::STATUS_DECLINED,
            'responded_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Booking request declined.');
    }
}

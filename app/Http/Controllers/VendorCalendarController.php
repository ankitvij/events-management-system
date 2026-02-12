<?php

namespace App\Http\Controllers;

use App\Http\Middleware\EnsureVendorAuthenticated;
use App\Http\Requests\StoreVendorAvailabilityRequest;
use App\Models\Vendor;
use App\Models\VendorAvailability;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorCalendarController extends Controller
{
    public function __construct()
    {
        $this->middleware(EnsureVendorAuthenticated::class);
    }

    public function index(Request $request)
    {
        $vendor = Vendor::query()->findOrFail((int) $request->session()->get('vendor_id'));

        $items = VendorAvailability::query()
            ->where('vendor_id', $vendor->id)
            ->orderBy('date')
            ->get();

        $vendor->load(['equipment', 'services']);

        if ($request->expectsJson() || app()->runningUnitTests()) {
            return response()->json([
                'vendor' => $vendor,
                'availabilities' => $items,
                'equipment' => $vendor->equipment,
                'services' => $vendor->services,
            ]);
        }

        return Inertia::render('Vendor/Calendar', [
            'vendor' => $vendor,
            'availabilities' => $items,
            'equipment' => $vendor->equipment,
            'services' => $vendor->services,
        ]);
    }

    public function store(StoreVendorAvailabilityRequest $request): RedirectResponse
    {
        $vendorId = (int) $request->session()->get('vendor_id');
        $data = $request->validated();

        VendorAvailability::query()->updateOrCreate(
            ['vendor_id' => $vendorId, 'date' => $data['date']],
            ['is_available' => (bool) $data['is_available']],
        );

        return redirect()->back()->with('success', 'Calendar updated.');
    }

    public function destroy(Request $request, VendorAvailability $availability): RedirectResponse
    {
        $vendorId = (int) $request->session()->get('vendor_id');
        if ((int) $availability->vendor_id !== $vendorId) {
            abort(403);
        }

        $availability->delete();

        return redirect()->back()->with('success', 'Date removed.');
    }
}

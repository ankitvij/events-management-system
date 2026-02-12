<?php

namespace App\Http\Controllers;

use App\Http\Middleware\EnsureVendorAuthenticated;
use App\Models\VendorEquipment;
use App\Models\VendorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class VendorPortalController extends Controller
{
    public function __construct()
    {
        $this->middleware(EnsureVendorAuthenticated::class);
    }

    public function storeEquipment(Request $request): RedirectResponse
    {
        $vendorId = (int) $request->session()->get('vendor_id');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['nullable', 'numeric', 'min:0'],
        ]);

        VendorEquipment::query()->create([
            'vendor_id' => $vendorId,
            'name' => $data['name'],
            'price' => $data['price'] ?? 0,
        ]);

        return redirect()->back()->with('success', 'Equipment added.');
    }

    public function destroyEquipment(Request $request, VendorEquipment $equipment): RedirectResponse
    {
        $vendorId = (int) $request->session()->get('vendor_id');
        if ((int) $equipment->vendor_id !== $vendorId) {
            abort(403);
        }

        $equipment->delete();

        return redirect()->back()->with('success', 'Equipment removed.');
    }

    public function storeService(Request $request): RedirectResponse
    {
        $vendorId = (int) $request->session()->get('vendor_id');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['nullable', 'numeric', 'min:0'],
        ]);

        VendorService::query()->create([
            'vendor_id' => $vendorId,
            'name' => $data['name'],
            'price' => $data['price'] ?? 0,
        ]);

        return redirect()->back()->with('success', 'Service added.');
    }

    public function destroyService(Request $request, VendorService $service): RedirectResponse
    {
        $vendorId = (int) $request->session()->get('vendor_id');
        if ((int) $service->vendor_id !== $vendorId) {
            abort(403);
        }

        $service->delete();

        return redirect()->back()->with('success', 'Service removed.');
    }
}

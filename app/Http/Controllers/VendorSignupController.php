<?php

namespace App\Http\Controllers;

use App\Enums\VendorType;
use App\Http\Requests\StoreVendorSignupRequest;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class VendorSignupController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Vendors/Signup', [
            'types' => VendorType::values(),
        ]);
    }

    public function store(StoreVendorSignupRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['active'] = false;

        Vendor::query()->create($data);

        return redirect()->route('vendors.signup')->with('success', 'Thanks! Your vendor profile was submitted and is pending activation.');
    }
}

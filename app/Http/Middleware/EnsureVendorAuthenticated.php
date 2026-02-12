<?php

namespace App\Http\Middleware;

use App\Models\Vendor;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureVendorAuthenticated
{
    public function handle(Request $request, Closure $next): Response
    {
        $vendorId = $request->session()->get('vendor_id');
        if (! $vendorId) {
            return redirect('/')->with('error', 'Please sign in as a vendor to continue.');
        }

        $vendor = Vendor::query()->find($vendorId);
        if (! $vendor) {
            $request->session()->forget('vendor_id');

            return redirect('/')->with('error', 'Please sign in as a vendor to continue.');
        }

        if (! $vendor->active) {
            return redirect('/')->with('error', 'Your vendor account is not active.');
        }

        return $next($request);
    }
}

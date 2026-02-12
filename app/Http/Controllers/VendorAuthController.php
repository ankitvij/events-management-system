<?php

namespace App\Http\Controllers;

use App\Mail\LoginTokenMail;
use App\Models\LoginToken;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class VendorAuthController extends Controller
{
    public function sendToken(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $vendor = Vendor::query()->where('email', $data['email'])->first();
        if (! $vendor) {
            return back()->withErrors(['email' => 'No vendor account found for that email'])->withInput();
        }

        if (! $vendor->active) {
            return back()->withErrors(['email' => 'This vendor account is not active'])->withInput();
        }

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
        $subject = 'Your vendor sign-in link';
        $intro = 'Click the link below to sign in and manage your calendar and bookings.';
        Mail::to($vendor->email)->send(new LoginTokenMail($url, $subject, $intro));

        return redirect()->back()->with('success', 'We emailed you a sign-in link.');
    }

    public function consumeToken(string $token): RedirectResponse
    {
        $hash = hash('sha256', $token);
        $record = LoginToken::query()
            ->valid()
            ->where('type', 'vendor')
            ->where('token_hash', $hash)
            ->firstOrFail();

        $vendor = Vendor::query()->find($record->vendor_id);
        if (! $vendor || $vendor->email !== $record->email) {
            abort(404);
        }

        if (! $vendor->active) {
            abort(403);
        }

        $record->update(['used_at' => now()]);
        LoginToken::query()
            ->where('type', 'vendor')
            ->where('vendor_id', $vendor->id)
            ->whereNull('used_at')
            ->delete();

        session()->put('vendor_id', $vendor->id);

        return redirect()->route('vendor.calendar')->with('success', 'You are signed in.');
    }

    public function logout(Request $request): RedirectResponse
    {
        $request->session()->forget('vendor_id');

        return redirect('/')->with('success', 'Logged out');
    }
}

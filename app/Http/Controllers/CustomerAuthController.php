<?php

namespace App\Http\Controllers;

use App\Http\Requests\CustomerEmailCheckRequest;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class CustomerAuthController extends Controller
{
    public function showRegister()
    {
        return inertia('Customer/Register');
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $attrs = [
            'name' => $data['name'],
            'active' => true,
        ];
        if (Schema::hasColumn('customers', 'password')) {
            $attrs['password'] = Hash::make($data['password']);
        }

        $customer = Customer::firstOrCreate([
            'email' => $data['email'],
        ], array_merge(['email' => $data['email']], $attrs));

        // mark customer as logged in via session
        session()->put('customer_id', $customer->id);

        return redirect()->route('home')->with('success', 'Account created and logged in');
    }

    public function showLogin()
    {
        return inertia('Customer/Login');
    }

    public function checkEmail(CustomerEmailCheckRequest $request): JsonResponse
    {
        $email = $request->input('email');
        $exists = Customer::query()->where('email', $email)->exists();

        return response()->json(['exists' => $exists]);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $customer = Customer::where('email', $data['email'])->first();
        if (! Schema::hasColumn('customers', 'password')) {
            return back()->withErrors(['email' => 'Password login is not enabled on this installation'])->withInput();
        }

        if (! $customer || ! $customer->password || ! Hash::check($data['password'], $customer->password)) {
            return back()->withErrors(['email' => 'Invalid credentials'])->withInput();
        }

        session()->put('customer_id', $customer->id);
        session()->forget(['customer_booking_order_id', 'customer_booking_code', 'customer_booking_email']);

        return redirect()->route('home')->with('success', 'Logged in');
    }

    public function bookingLogin(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'booking_code' => ['required', 'string'],
        ]);

        $order = \App\Models\Order::where('booking_code', $data['booking_code'])->first();
        if (! $order) {
            return back()->withErrors(['booking_code' => 'Invalid booking code'])->withInput();
        }

        $matches = false;
        if ($order->contact_email && $order->contact_email === $data['email']) {
            $matches = true;
        }
        if ($order->user && $order->user->email === $data['email']) {
            $matches = true;
        }

        if (! $matches) {
            return back()->withErrors(['email' => 'Email does not match our records'])->withInput();
        }

        session()->forget('customer_id');
        session()->put('customer_booking_order_id', $order->id);
        session()->put('customer_booking_code', $order->booking_code);
        session()->put('customer_booking_email', $data['email']);

        return redirect()->route('customer.orders')->with('success', 'Logged in');
    }

    public function logout(Request $request)
    {
        session()->forget('customer_id');
        session()->forget(['customer_booking_order_id', 'customer_booking_code', 'customer_booking_email']);

        return redirect()->route('home')->with('success', 'Logged out');
    }

    public function bookingAccess(Request $request, Order $order)
    {
        if (! $request->hasValidSignature()) {
            abort(403);
        }

        $email = $request->query('email');
        if (! $email) {
            abort(403);
        }

        $matches = false;
        if ($order->contact_email && $order->contact_email === $email) {
            $matches = true;
        }
        if ($order->user && $order->user->email === $email) {
            $matches = true;
        }

        if (! $matches) {
            abort(403);
        }

        session()->forget('customer_id');
        session()->put('customer_booking_order_id', $order->id);
        session()->put('customer_booking_code', $order->booking_code);
        session()->put('customer_booking_email', $email);

        return redirect()->route('customer.orders');
    }
}

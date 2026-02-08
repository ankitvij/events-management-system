<?php

namespace App\Http\Controllers;

use App\Http\Requests\CustomerEmailCheckRequest;
use App\Models\Customer;
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

        return redirect()->route('home')->with('success', 'Logged in');
    }

    public function logout(Request $request)
    {
        session()->forget('customer_id');

        return redirect()->route('home')->with('success', 'Logged out');
    }
}

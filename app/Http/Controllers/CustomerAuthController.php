<?php

namespace App\Http\Controllers;

use App\Http\Requests\CustomerEmailCheckRequest;
use App\Mail\LoginTokenMail;
use App\Models\Customer;
use App\Models\LoginToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

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
            'password' => 'nullable|string',
        ]);

        if (! $data['password']) {
            $customer = Customer::query()->where('email', $data['email'])->first();
            if (! $customer) {
                return back()->withErrors(['email' => 'No account found for that email'])->withInput();
            }

            $this->sendLoginToken($customer);

            return back()->with('status', 'We emailed you a sign-in link.');
        }

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

    public function consumeLoginToken(string $token)
    {
        $hash = hash('sha256', $token);
        $record = LoginToken::query()
            ->valid()
            ->where('type', 'customer')
            ->where('token_hash', $hash)
            ->firstOrFail();

        $customer = Customer::query()->find($record->customer_id);
        if (! $customer || $customer->email !== $record->email) {
            abort(404);
        }

        $record->update(['used_at' => now()]);
        LoginToken::query()
            ->where('type', 'customer')
            ->where('customer_id', $customer->id)
            ->whereNull('used_at')
            ->delete();

        session()->put('customer_id', $customer->id);
        session()->forget(['customer_booking_order_id', 'customer_booking_code', 'customer_booking_email']);

        return redirect()->route('customer.orders')->with('success', 'You are signed in.');
    }

    protected function sendLoginToken(Customer $customer): void
    {
        $plain = Str::random(64);
        $hash = hash('sha256', $plain);

        LoginToken::query()
            ->where('type', 'customer')
            ->where('customer_id', $customer->id)
            ->delete();

        LoginToken::query()->create([
            'email' => $customer->email,
            'token_hash' => $hash,
            'type' => 'customer',
            'customer_id' => $customer->id,
            'expires_at' => now()->addMinutes(30),
        ]);

        $url = route('customer.login.token.consume', ['token' => $plain]);
        $subject = 'Your sign-in link';
        $intro = 'Click the link below to sign in to your account.';
        Mail::to($customer->email)->send(new LoginTokenMail($url, $subject, $intro));
    }

    public function logout(Request $request)
    {
        session()->forget('customer_id');
        session()->forget(['customer_booking_order_id', 'customer_booking_code', 'customer_booking_email']);

        return redirect()->route('home')->with('success', 'Logged out');
    }
}

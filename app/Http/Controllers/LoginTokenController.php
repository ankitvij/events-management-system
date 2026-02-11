<?php

namespace App\Http\Controllers;

use App\Mail\LoginTokenMail;
use App\Models\LoginToken;
use App\Models\User;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class LoginTokenController extends Controller
{
    public function send(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::query()->where('email', $data['email'])->first();
        if (! $user) {
            return back()->withErrors(['email' => 'No account found for that email'])->withInput();
        }

        $token = $this->issueToken('user', $user->email, $user->id, null);
        $url = route('login.token.consume', ['token' => $token]);
        $subject = 'Your sign-in link';
        $intro = 'Click the link below to sign in to your account.';
        Mail::to($user->email)->send(new LoginTokenMail($url, $subject, $intro));

        return back()->with('status', 'We emailed you a sign-in link.');
    }

    public function consume(string $token, Guard $guard): RedirectResponse
    {
        $hash = hash('sha256', $token);
        $record = LoginToken::query()
            ->valid()
            ->where('type', 'user')
            ->where('token_hash', $hash)
            ->firstOrFail();

        $user = User::query()->find($record->user_id);
        if (! $user || $user->email !== $record->email) {
            abort(404);
        }

        $record->update(['used_at' => now()]);
        LoginToken::query()
            ->where('type', 'user')
            ->where('user_id', $user->id)
            ->whereNull('used_at')
            ->delete();

        $guard->login($user, true);

        return redirect()->intended(route('dashboard'))->with('success', 'You are signed in.');
    }

    private function issueToken(string $type, string $email, ?int $userId, ?int $customerId): string
    {
        $plain = Str::random(64);
        $hash = hash('sha256', $plain);

        LoginToken::query()
            ->where('type', $type)
            ->where(function ($query) use ($userId, $customerId) {
                if ($userId) {
                    $query->where('user_id', $userId);
                }
                if ($customerId) {
                    $query->orWhere('customer_id', $customerId);
                }
            })
            ->delete();

        LoginToken::query()->create([
            'email' => $email,
            'token_hash' => $hash,
            'type' => $type,
            'user_id' => $userId,
            'customer_id' => $customerId,
            'expires_at' => now()->addMinutes(30),
        ]);

        return $plain;
    }
}

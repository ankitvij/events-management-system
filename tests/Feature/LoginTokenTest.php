<?php

namespace Tests\Feature;

use App\Mail\LoginTokenMail;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class LoginTokenTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_request_and_use_login_token(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'organiser@example.com',
        ]);

        $response = $this->from('/login')->post('/login/token', [
            'email' => $user->email,
        ]);

        $response->assertRedirect('/login');
        $response->assertSessionHas('status', 'We emailed you a sign-in link.');

        $loginUrl = null;
        Mail::assertSent(LoginTokenMail::class, function (LoginTokenMail $mail) use (&$loginUrl, $user) {
            $loginUrl = $mail->loginUrl;

            return $mail->hasTo($user->email);
        });

        $this->assertNotNull($loginUrl);

        $consume = $this->get($loginUrl);
        $consume->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_customer_can_request_and_use_login_token(): void
    {
        Mail::fake();

        $customer = Customer::factory()->create([
            'email' => 'customer@example.com',
        ]);

        $response = $this->from('/customer/login')->post('/customer/login', [
            'email' => $customer->email,
            'password' => '',
        ]);

        $response->assertRedirect('/customer/login');
        $response->assertSessionHas('status', 'We emailed you a sign-in link.');

        $loginUrl = null;
        Mail::assertSent(LoginTokenMail::class, function (LoginTokenMail $mail) use (&$loginUrl, $customer) {
            $loginUrl = $mail->loginUrl;

            return $mail->hasTo($customer->email);
        });

        $this->assertNotNull($loginUrl);

        $consume = $this->get($loginUrl);
        $consume->assertRedirect(route('customer.orders'));
        $this->assertSame($customer->id, session('customer_id'));
    }

    public function test_user_login_token_request_fails_for_unknown_email(): void
    {
        Mail::fake();

        $response = $this->from('/login')->post('/login/token', [
            'email' => 'missing@example.com',
        ]);

        $response->assertRedirect('/login');
        $response->assertSessionHasErrors('email');
        Mail::assertNothingSent();
    }

    public function test_customer_login_token_request_fails_for_unknown_email(): void
    {
        Mail::fake();

        $response = $this->from('/customer/login')->post('/customer/login', [
            'email' => 'missing@example.com',
            'password' => '',
        ]);

        $response->assertRedirect('/customer/login');
        $response->assertSessionHasErrors('email');
        Mail::assertNothingSent();
    }
}

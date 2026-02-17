<?php

namespace Tests\Feature;

use App\Mail\LoginTokenMail;
use App\Models\Organiser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class OrganiserAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_organiser_can_request_and_use_login_token(): void
    {
        Mail::fake();

        $organiser = Organiser::query()->create([
            'name' => 'Org Auth',
            'email' => 'organiser-auth@example.test',
            'active' => true,
        ]);

        $response = $this->from('/organisers/login')->post('/organisers/login/token', [
            'email' => $organiser->email,
        ]);

        $response->assertRedirect('/organisers/login');
        $response->assertSessionHas('success', 'We emailed you a sign-in link.');

        $loginUrl = null;
        Mail::assertSent(LoginTokenMail::class, function (LoginTokenMail $mail) use (&$loginUrl, $organiser) {
            $loginUrl = $mail->loginUrl;

            return $mail->hasTo($organiser->email);
        });

        $this->assertNotNull($loginUrl);

        $consume = $this->get($loginUrl);
        $consume->assertRedirect('/organisers');
        $this->assertSame($organiser->id, session('organiser_id'));
    }

    public function test_organiser_login_token_request_fails_for_unknown_email(): void
    {
        Mail::fake();

        $response = $this->from('/organisers/login')->post('/organisers/login/token', [
            'email' => 'missing-organiser@example.test',
        ]);

        $response->assertRedirect('/organisers/login');
        $response->assertSessionHasErrors('email');
        Mail::assertNothingSent();
    }

    public function test_organiser_login_token_request_fails_for_inactive_organiser(): void
    {
        Mail::fake();

        Organiser::query()->create([
            'name' => 'Inactive Org',
            'email' => 'inactive-organiser@example.test',
            'active' => false,
        ]);

        $response = $this->from('/organisers/login')->post('/organisers/login/token', [
            'email' => 'inactive-organiser@example.test',
        ]);

        $response->assertRedirect('/organisers/login');
        $response->assertSessionHasErrors('email');
        Mail::assertNothingSent();
    }
}

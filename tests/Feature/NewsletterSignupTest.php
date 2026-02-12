<?php

namespace Tests\Feature;

use App\Models\NewsletterSignup;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NewsletterSignupTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_sign_up_for_newsletter(): void
    {
        $response = $this->post(route('newsletter.signup'), [
            'email' => 'test@example.test',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('newsletter_success');

        $this->assertDatabaseHas('newsletter_signups', [
            'email' => 'test@example.test',
        ]);
    }

    public function test_newsletter_email_must_be_unique(): void
    {
        NewsletterSignup::query()->create(['email' => 'test@example.test']);

        $response = $this->post(route('newsletter.signup'), [
            'email' => 'test@example.test',
        ]);

        $response->assertSessionHasErrors('email');
    }
}

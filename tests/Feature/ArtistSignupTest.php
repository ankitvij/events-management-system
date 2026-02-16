<?php

namespace Tests\Feature;

use App\Mail\ArtistVerifyEmail;
use App\Models\Artist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class ArtistSignupTest extends TestCase
{
    use RefreshDatabase;

    public function test_artist_can_sign_up_from_landing_and_must_verify_email_to_activate(): void
    {
        Mail::fake();
        Storage::fake('public');

        $response = $this->post(route('artists.signup'), [
            'name' => 'Test Artist',
            'email' => 'artist@example.test',
            'city' => 'Berlin',
            'experience_years' => 5,
            'skills' => 'DJ, House, Techno',
            'artist_types' => ['dj', 'performer'],
            'description' => 'Bio',
            'equipment' => 'CDJs',
            'photo' => UploadedFile::fake()->image('artist.jpg', 600, 600),
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $artist = Artist::query()->where('email', 'artist@example.test')->firstOrFail();
        $this->assertFalse((bool) $artist->active);
        $this->assertNull($artist->email_verified_at);
        $this->assertNotNull($artist->verify_token);
        $this->assertSame(['dj', 'performer'], $artist->artist_types);
        $this->assertNotNull($artist->city_id);

        Storage::disk('public')->assertExists($artist->photo);

        Mail::assertSent(ArtistVerifyEmail::class);

        $verifyUrl = URL::signedRoute('artists.verify', [
            'artist' => $artist->id,
            'token' => $artist->verify_token,
        ]);

        $verify = $this->get($verifyUrl);
        $verify->assertRedirect('/');
        $verify->assertSessionHas('success');

        $artist->refresh();
        $this->assertTrue((bool) $artist->active);
        $this->assertNotNull($artist->email_verified_at);
        $this->assertNull($artist->verify_token);
    }

    public function test_artist_verify_rejects_wrong_token(): void
    {
        Storage::fake('public');

        $artist = Artist::factory()->create([
            'active' => false,
            'email_verified_at' => null,
            'verify_token' => str_repeat('a', 64),
        ]);

        $verifyUrl = URL::signedRoute('artists.verify', [
            'artist' => $artist->id,
            'token' => str_repeat('b', 64),
        ]);

        $resp = $this->get($verifyUrl);
        $resp->assertStatus(403);
    }
}

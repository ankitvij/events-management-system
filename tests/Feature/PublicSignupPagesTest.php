<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicSignupPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_open_signup_pages(): void
    {
        $this->get('/artists/signup')->assertStatus(200);
        $this->get('/promoters/signup')->assertStatus(200);
        $this->get('/vendors/signup')->assertStatus(200);
    }

    public function test_guest_can_submit_promoter_signup(): void
    {
        $response = $this->post('/promoters/signup', [
            'name' => 'Promoter Test',
            'email' => 'promoter@example.test',
        ]);

        $response->assertRedirect('/promoters/signup');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas((new User)->getTable(), [
            'name' => 'Promoter Test',
            'email' => 'promoter@example.test',
            'active' => false,
        ]);
    }

    public function test_guest_can_submit_vendor_signup(): void
    {
        $response = $this->post('/vendors/signup', [
            'name' => 'Vendor Test',
            'email' => 'vendor@example.test',
            'type' => 'other',
            'city' => 'London',
            'description' => 'Vendor description',
        ]);

        $response->assertRedirect('/vendors/signup');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas((new Vendor)->getTable(), [
            'name' => 'Vendor Test',
            'email' => 'vendor@example.test',
            'type' => 'other',
            'active' => false,
        ]);

        $vendor = Vendor::query()->where('email', 'vendor@example.test')->first();
        $this->assertNotNull($vendor);
        $this->assertNotNull($vendor->city_id);
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganisersCustomersTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_access_organisers_and_customers()
    {
        $super = User::factory()->create([
            'email' => 'super@example.com',
            'role' => 'super_admin',
            'is_super_admin' => true,
        ]);

        $this->actingAs($super)->get('/organisers')->assertStatus(200);
        $this->actingAs($super)->get('/customers')->assertStatus(200);
    }

    public function test_regular_user_auth_required()
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/organisers')->assertStatus(200);
        $this->actingAs($user)->get('/customers')->assertStatus(200);
    }
}

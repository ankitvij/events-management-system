<?php

namespace Tests\Feature;

use App\Models\Organiser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganisersFilteringTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_organisers_by_name_or_email()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        Organiser::create(['name' => 'Gamma Org', 'email' => 'g@example.com']);
        Organiser::create(['name' => 'Delta Org', 'email' => 'd@example.com']);

        $res = $this->getJson('/organisers?q=Gamma');
        $res->assertStatus(200);
        $data = $res->json('organisers.data');
        $this->assertCount(1, $data);
        $this->assertStringContainsString('Gamma', $data[0]['name']);
    }
}

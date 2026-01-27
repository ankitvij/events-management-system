<?php

namespace Tests\Feature;

use App\Models\Organiser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganisersSearchSortTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_filters_organisers()
    {
        $super = User::factory()->create(['is_super_admin' => true]);
        Organiser::create(['name' => 'FindOrg', 'email' => 'find@org.test', 'active' => true]);
        Organiser::create(['name' => 'Other Org', 'email' => 'other@org.test', 'active' => true]);

        $resp = $this->actingAs($super)->get('/organisers?q=FindOrg');

        $resp->assertStatus(200);
        $content = $resp->getContent();
        $this->assertStringContainsString('FindOrg', $content);
    }

    public function test_sort_orders_organisers_by_name()
    {
        $super = User::factory()->create(['is_super_admin' => true]);
        Organiser::create(['name' => 'Zeta Org', 'email' => 'z@org.test', 'active' => true]);
        Organiser::create(['name' => 'Alpha Org', 'email' => 'a@org.test', 'active' => true]);

        $resp = $this->actingAs($super)->get('/organisers?sort=name_asc');
        $resp->assertStatus(200);
        $content = $resp->getContent();
        $posAlpha = strpos($content, 'Alpha Org');
        $posZeta = strpos($content, 'Zeta Org');
        $this->assertNotFalse($posAlpha);
        $this->assertNotFalse($posZeta);
        $this->assertTrue($posAlpha < $posZeta, 'Expected Alpha Org to appear before Zeta Org');
    }
}

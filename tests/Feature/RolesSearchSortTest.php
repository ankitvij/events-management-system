<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolesSearchSortTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_filters_roles_listing()
    {
        $super = User::factory()->create(['is_super_admin' => true]);
        User::factory()->create(['name' => 'RoleFind', 'email' => 'rolefind@example.test']);
        User::factory()->create(['name' => 'Another', 'email' => 'another@example.test']);

        $resp = $this->actingAs($super)->get('/roles?q=RoleFind');

        $resp->assertStatus(200);
        $content = $resp->getContent();
        $this->assertStringContainsString('RoleFind', $content);
    }

    public function test_sort_orders_roles_by_name()
    {
        $super = User::factory()->create(['is_super_admin' => true]);
        User::factory()->create(['name' => 'Zed Role', 'email' => 'z@role.test']);
        User::factory()->create(['name' => 'Aaron Role', 'email' => 'a@role.test']);

        $resp = $this->actingAs($super)->get('/roles?sort=name_asc');
        $resp->assertStatus(200);
        $content = $resp->getContent();
        $posAaron = strpos($content, 'Aaron Role');
        $posZed = strpos($content, 'Zed Role');
        $this->assertNotFalse($posAaron);
        $this->assertNotFalse($posZed);
        $this->assertTrue($posAaron < $posZed, 'Expected Aaron Role to appear before Zed Role');
    }
}

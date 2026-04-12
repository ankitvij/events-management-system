<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\ModuleSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ModuleSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_view_module_settings(): void
    {
        $user = User::factory()->create([
            'role' => Role::SUPER_ADMIN,
            'is_super_admin' => true,
        ]);

        $this->actingAs($user)
            ->get(route('settings.modules.edit'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/modules')
                ->has('module_settings')
            );
    }

    public function test_non_super_admin_cannot_view_module_settings(): void
    {
        $user = User::factory()->create([
            'role' => Role::ADMIN,
            'is_super_admin' => false,
        ]);

        $this->actingAs($user)
            ->get(route('settings.modules.edit'))
            ->assertForbidden();
    }

    public function test_super_admin_can_update_module_settings(): void
    {
        $user = User::factory()->create([
            'role' => Role::SUPER_ADMIN,
            'is_super_admin' => true,
        ]);

        $payload = [
            'agencies_enabled' => false,
            'organisers_enabled' => true,
            'artists_enabled' => false,
            'promoters_enabled' => true,
            'vendors_enabled' => false,
            'venues_enabled' => true,
        ];

        $this->actingAs($user)
            ->put(route('settings.modules.update'), $payload)
            ->assertRedirect(route('settings.modules.edit'));

        $settings = ModuleSetting::query()->first();
        $this->assertNotNull($settings);
        $this->assertFalse($settings->agencies_enabled);
        $this->assertTrue($settings->organisers_enabled);
        $this->assertFalse($settings->artists_enabled);
        $this->assertTrue($settings->promoters_enabled);
        $this->assertFalse($settings->vendors_enabled);
        $this->assertTrue($settings->venues_enabled);
    }

    public function test_disabled_module_returns_not_found_for_non_super_admins(): void
    {
        ModuleSetting::query()->create([
            'agencies_enabled' => false,
            'organisers_enabled' => true,
            'artists_enabled' => true,
            'promoters_enabled' => true,
            'vendors_enabled' => true,
            'venues_enabled' => true,
        ]);

        $this->get('/agencies')->assertNotFound();
    }

    public function test_super_admin_can_still_access_disabled_module_routes(): void
    {
        ModuleSetting::query()->create([
            'agencies_enabled' => false,
            'organisers_enabled' => true,
            'artists_enabled' => true,
            'promoters_enabled' => true,
            'vendors_enabled' => true,
            'venues_enabled' => true,
        ]);

        $user = User::factory()->create([
            'role' => Role::SUPER_ADMIN,
            'is_super_admin' => true,
        ]);

        $this->actingAs($user)->get('/agencies')->assertOk();
    }
}

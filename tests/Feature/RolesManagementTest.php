<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolesManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_super_cannot_access_roles_index(): void
    {
        $user = User::factory()->create(['is_super_admin' => false]);

        $response = $this->actingAs($user)->get(route('roles.index'));

        $response->assertStatus(403);
    }

    public function test_super_can_update_user_role(): void
    {
        $super = User::factory()->create(['is_super_admin' => true]);
        $target = User::factory()->create(['is_super_admin' => false, 'role' => Role::USER->value]);

        $response = $this->actingAs($super)->put(route('roles.users.update', $target->id), [
            'role' => Role::ADMIN->value,
        ]);

        $response->assertRedirect(route('roles.index'));
        $this->assertDatabaseHas('users', ['id' => $target->id, 'role' => Role::ADMIN->value]);
    }
}

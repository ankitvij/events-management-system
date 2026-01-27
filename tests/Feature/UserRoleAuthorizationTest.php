<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_super_cannot_assign_admin_on_store(): void
    {
        $user = User::factory()->create(['is_super_admin' => false]);

        $response = $this->actingAs($user)->post(route('users.store'), [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'role' => Role::ADMIN->value,
        ]);

        $response->assertStatus(403);
    }

    public function test_super_can_assign_admin_on_store(): void
    {
        $super = User::factory()->create(['is_super_admin' => true]);

        $response = $this->actingAs($super)->post(route('users.store'), [
            'name' => 'New Admin',
            'email' => 'newadmin@example.com',
            'password' => 'password123',
            'role' => Role::ADMIN->value,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['email' => 'newadmin@example.com', 'role' => Role::ADMIN->value]);
    }

    public function test_non_super_cannot_promote_to_super_admin_on_update(): void
    {
        $user = User::factory()->create(['is_super_admin' => false]);
        $target = User::factory()->create(['is_super_admin' => false]);

        $response = $this->actingAs($user)->put(route('users.update', $target->id), [
            'name' => $target->name,
            'email' => $target->email,
            'role' => Role::SUPER_ADMIN->value,
        ]);

        $response->assertStatus(403);
    }

    public function test_non_super_cannot_edit_super_admin(): void
    {
        $user = User::factory()->create(['is_super_admin' => false]);
        $target = User::factory()->create(['is_super_admin' => true]);

        $response = $this->actingAs($user)->put(route('users.update', $target->id), [
            'name' => $target->name,
            'email' => $target->email,
        ]);

        $response->assertStatus(403);
    }
}

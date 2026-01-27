<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAuditTest extends TestCase
{
    use RefreshDatabase;

    public function test_role_change_records_audit_and_undo(): void
    {
        $super = User::factory()->create(['is_super_admin' => true]);
        $target = User::factory()->create(['is_super_admin' => false, 'role' => Role::USER->value]);

        $this->actingAs($super)->put(route('roles.users.update', $target->id), [
            'role' => Role::ADMIN->value,
        ])->assertRedirect(route('roles.index'));

        $this->assertDatabaseHas('role_changes', [
            'user_id' => $target->id,
            'old_role' => Role::USER->value,
            'new_role' => Role::ADMIN->value,
        ]);

        // Undo
        $this->actingAs($super)->post(route('roles.users.undo', $target->id))
            ->assertRedirect(route('roles.index'));

        $this->assertDatabaseHas('role_changes', [
            'user_id' => $target->id,
            'old_role' => Role::ADMIN->value,
            'new_role' => Role::USER->value,
        ]);

        $this->assertDatabaseHas('users', ['id' => $target->id, 'role' => Role::USER->value]);
    }
}

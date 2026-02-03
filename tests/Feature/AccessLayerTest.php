<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\Customer;
use App\Models\Event;
use App\Models\Organiser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccessLayerTest extends TestCase
{
    use RefreshDatabase;

    protected function makeUser(string $role = 'user', bool $super = false): User
    {
        return User::factory()->create([
            'role' => $role,
            'is_super_admin' => $super,
        ]);
    }

    public function test_access_matrix_for_common_modules(): void
    {
        // Prepare resources
        $event = Event::factory()->create();
        $organiser = Organiser::create(['name' => 'Org', 'email' => 'org@example.test', 'active' => true]);
        $customer = Customer::create(['name' => 'Cust', 'email' => 'cust@example.test', 'phone' => '123']);

        // Define routes to test and expected status codes per role: guest, user, admin, super
        $matrix = [
            ['method' => 'get', 'route' => route('events.index'), 'guest' => 200, 'user' => 200, 'admin' => 200, 'super' => 200],
            ['method' => 'get', 'route' => route('events.show', $event), 'guest' => 200, 'user' => 200, 'admin' => 200, 'super' => 200],
            ['method' => 'get', 'route' => route('organisers.index'), 'guest' => 302, 'user' => 200, 'admin' => 200, 'super' => 200],
            ['method' => 'get', 'route' => route('organisers.show', $organiser), 'guest' => 302, 'user' => 200, 'admin' => 200, 'super' => 200],
            ['method' => 'get', 'route' => route('pages.index'), 'guest' => 302, 'user' => 200, 'admin' => 200, 'super' => 200],
            ['method' => 'get', 'route' => route('users.index'), 'guest' => 302, 'user' => 200, 'admin' => 200, 'super' => 200],
            ['method' => 'get', 'route' => route('roles.index'), 'guest' => 302, 'user' => 403, 'admin' => 403, 'super' => 200],
            ['method' => 'get', 'route' => route('customers.index'), 'guest' => 302, 'user' => 200, 'admin' => 200, 'super' => 200],
            ['method' => 'get', 'route' => route('profile.edit'), 'guest' => 302, 'user' => 200, 'admin' => 200, 'super' => 200],
        ];

        // Test guest
        foreach ($matrix as $m) {
            $res = $this->{$m['method']}($m['route']);
            $res->assertStatus($m['guest']);
        }

        // Regular user
        $user = $this->makeUser('user', false);
        $this->actingAs($user);
        foreach ($matrix as $m) {
            $res = $this->{$m['method']}($m['route']);
            $res->assertStatus($m['user']);
        }

        // Admin
        $admin = $this->makeUser('admin', false);
        $this->actingAs($admin);
        foreach ($matrix as $m) {
            $res = $this->{$m['method']}($m['route']);
            $res->assertStatus($m['admin']);
        }

        // Super admin
        $super = $this->makeUser('super_admin', true);
        $this->actingAs($super);
        foreach ($matrix as $m) {
            $res = $this->{$m['method']}($m['route']);
            $res->assertStatus($m['super']);
        }
    }
}

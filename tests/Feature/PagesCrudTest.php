<?php

namespace Tests\Feature;

use App\Models\Page;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PagesCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_pages_index(): void
    {
        $resp = $this->get(route('pages.index'));
        $resp->assertRedirect('/login');
    }

    public function test_user_can_create_update_delete_page(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $this->actingAs($user);

        // create
        $resp = $this->post(route('pages.store'), [
            'title' => 'Test Page',
            'slug' => 'test-page',
            'content' => '<p>Hello</p>',
            'active' => true,
        ]);
        $resp->assertRedirect(route('pages.index'));

        $page = Page::where('slug', 'test-page')->firstOrFail();

        // update
        $upd = $this->put(route('pages.update', $page), [
            'title' => 'Updated',
            'slug' => 'test-page',
            'content' => '<p>Updated</p>',
            'active' => false,
        ]);
        $upd->assertRedirect(route('pages.show', $page));

        $this->assertDatabaseHas('pages', ['id' => $page->id, 'title' => 'Updated', 'active' => false]);

        // delete
        $del = $this->delete(route('pages.destroy', $page));
        $del->assertRedirect(route('pages.index'));
        $this->assertDatabaseMissing('pages', ['id' => $page->id]);
    }

    public function test_admin_can_access_pages(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);
        $resp = $this->get(route('pages.index'));
        $resp->assertStatus(200);
    }
}

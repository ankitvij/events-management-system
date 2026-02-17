<?php

namespace Tests\Feature;

use App\Mail\EventOrganiserCreated;
use App\Models\Artist;
use App\Models\Event;
use App\Models\EventTicketController;
use App\Models\Organiser;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EventCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_read_update_delete_event(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $this->actingAs($user);

        $primaryOrganiser = Organiser::create([
            'name' => 'Primary Org',
            'email' => 'primary@example.test',
            'active' => true,
        ]);

        // Create
        $response = $this->post(route('events.store'), [
            'title' => 'My Test Event',
            'start_at' => now()->addDay()->toDateString(),
            'end_at' => now()->addDays(2)->toDateString(),
            'city' => 'Berlin',
            'country' => 'Germany',
            'organiser_id' => $primaryOrganiser->id,
            'organiser_emails' => 'alice@example.test,bob@example.test',
            'image' => UploadedFile::fake()->image('event.jpg', 1200, 800),
            'tickets' => [
                ['name' => 'General Admission', 'price' => 10, 'quantity_total' => 100],
            ],
        ]);

        $response->assertRedirect(route('events.index'));

        $this->assertDatabaseHas('events', [
            'title' => 'My Test Event',
            'user_id' => $user->id,
            'organiser_id' => $primaryOrganiser->id,
        ]);

        $event = Event::where('title', 'My Test Event')->firstOrFail();
        $this->assertNotNull($event->country_id);
        $this->assertNotNull($event->city_id);

        // organisers created from emails should exist and be attached
        $this->assertDatabaseHas('organisers', ['email' => 'alice@example.test']);
        $this->assertDatabaseHas('organisers', ['email' => 'bob@example.test']);
        $alice = \App\Models\Organiser::where('email', 'alice@example.test')->first();
        $this->assertDatabaseHas('event_organiser', ['event_id' => $event->id, 'organiser_id' => $alice->id]);

        // Read
        $show = $this->get(route('events.show', $event));
        $show->assertStatus(200);

        // Update
        $update = $this->put(route('events.update', $event), [
            'title' => 'Updated Event',
            'description' => 'Updated',
            'start_at' => now()->addDay()->toDateString(),
            'end_at' => now()->addDays(3)->toDateString(),
            'city' => 'Berlin',
            'organiser_id' => $primaryOrganiser->id,
        ]);

        $event->refresh();
        $update->assertRedirect(route('events.show', $event));

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Updated Event',
        ]);

        // Delete
        $delete = $this->delete(route('events.destroy', $event));
        $delete->assertRedirect(route('events.index'));

        $this->assertDatabaseMissing('events', ['id' => $event->id]);
    }

    public function test_store_and_update_syncs_organiser_links(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $this->actingAs($user);

        $primaryOrganiser = Organiser::create([
            'name' => 'Primary Org',
            'email' => 'primary@example.test',
            'active' => true,
        ]);

        $secondaryOrganiser = Organiser::create([
            'name' => 'Secondary Org',
            'email' => 'secondary@example.test',
            'active' => true,
        ]);

        $create = $this->post(route('events.store'), [
            'title' => 'Organiser Link Event',
            'start_at' => now()->addDay()->toDateString(),
            'city' => 'Paris',
            'organiser_id' => $primaryOrganiser->id,
            'organiser_ids' => [$primaryOrganiser->id],
            'image' => UploadedFile::fake()->image('event.jpg', 1200, 800),
            'tickets' => [
                ['name' => 'Standard', 'price' => 0, 'quantity_total' => 10],
            ],
        ]);

        $create->assertRedirect(route('events.index'));

        $event = Event::where('title', 'Organiser Link Event')->firstOrFail();

        $this->assertTrue($event->organisers()->whereKey($primaryOrganiser->id)->exists());
        $this->assertSame($primaryOrganiser->id, $event->organiser_id);

        $update = $this->put(route('events.update', $event), [
            'title' => 'Organiser Link Event Updated',
            'start_at' => now()->addDays(2)->toDateString(),
            'end_at' => now()->addDays(3)->toDateString(),
            'city' => 'Paris',
            'organiser_id' => $secondaryOrganiser->id,
            'organiser_ids' => [$secondaryOrganiser->id],
        ]);

        $event->refresh();

        $update->assertRedirect(route('events.show', $event));

        $this->assertFalse($event->organisers()->whereKey($primaryOrganiser->id)->exists());
        $this->assertTrue($event->organisers()->whereKey($secondaryOrganiser->id)->exists());
        $this->assertSame($secondaryOrganiser->id, $event->organiser_id);
    }

    public function test_store_requires_main_organiser_for_authenticated_user(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('events.store'), [
            'title' => 'Missing Main',
            'start_at' => now()->addDay()->toDateString(),
            'city' => 'Rome',
            'image' => UploadedFile::fake()->image('event.jpg', 1200, 800),
            'tickets' => [
                ['name' => 'Standard', 'price' => 0, 'quantity_total' => 10],
            ],
        ]);

        $response->assertSessionHasErrors('organiser_id');
    }

    public function test_event_can_sync_multiple_promoters_and_vendors(): void
    {
        Storage::fake('public');

        $owner = User::factory()->create();
        $this->actingAs($owner);

        $organiser = Organiser::create([
            'name' => 'Main Org',
            'email' => 'main-org@example.test',
            'active' => true,
        ]);

        $promoterA = User::factory()->create(['name' => 'Promoter A', 'active' => true, 'is_super_admin' => false]);
        $promoterB = User::factory()->create(['name' => 'Promoter B', 'active' => true, 'is_super_admin' => false]);
        $vendorA = Vendor::factory()->create(['active' => true]);
        $vendorB = Vendor::factory()->create(['active' => true]);
        $artistA = Artist::factory()->create(['active' => true]);
        $artistB = Artist::factory()->create(['active' => true]);

        $create = $this->post(route('events.store'), [
            'title' => 'Linked Event',
            'start_at' => now()->addDay()->toDateString(),
            'city' => 'Prague',
            'organiser_id' => $organiser->id,
            'promoter_ids' => [$promoterA->id],
            'vendor_ids' => [$vendorA->id],
            'image' => UploadedFile::fake()->image('event.jpg', 1200, 800),
            'tickets' => [
                ['name' => 'Standard', 'price' => 25, 'quantity_total' => 50],
            ],
        ]);

        $create->assertRedirect(route('events.index'));

        $event = Event::query()->where('title', 'Linked Event')->firstOrFail();

        $this->assertTrue($event->promoters()->whereKey($promoterA->id)->exists());
        $this->assertTrue($event->vendors()->whereKey($vendorA->id)->exists());
        $this->assertFalse($event->artists()->whereKey($artistA->id)->exists());

        $update = $this->put(route('events.update', $event), [
            'title' => 'Linked Event Updated',
            'start_at' => now()->addDays(2)->toDateString(),
            'end_at' => now()->addDays(3)->toDateString(),
            'city' => 'Prague',
            'organiser_id' => $organiser->id,
            'promoter_ids' => [$promoterB->id],
            'vendor_ids' => [$vendorB->id],
            'artist_ids' => [$artistB->id],
        ]);
        $event->refresh();

        $update->assertRedirect(route('events.show', $event));

        $this->assertFalse($event->promoters()->whereKey($promoterA->id)->exists());
        $this->assertTrue($event->promoters()->whereKey($promoterB->id)->exists());
        $this->assertFalse($event->vendors()->whereKey($vendorA->id)->exists());
        $this->assertTrue($event->vendors()->whereKey($vendorB->id)->exists());
        $this->assertFalse($event->artists()->whereKey($artistA->id)->exists());
        $this->assertTrue($event->artists()->whereKey($artistB->id)->exists());
    }

    public function test_guests_cannot_see_organisers_and_see_placeholder(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $this->actingAs($user);

        // Create event with organisers via emails
        $response = $this->post(route('events.store'), [
            'title' => 'Public Visibility Event',
            'start_at' => now()->addDay()->toDateString(),
            'city' => 'Lisbon',
            'organiser_id' => Organiser::create(['name' => 'Org Public', 'email' => 'public@example.test', 'active' => true])->id,
            'organiser_emails' => 'alice@example.test,bob@example.test',
            'image' => UploadedFile::fake()->image('event.jpg', 1200, 800),
            'tickets' => [
                ['name' => 'Standard', 'price' => 0, 'quantity_total' => 10],
            ],
        ]);

        $response->assertRedirect(route('events.index'));

        $event = Event::where('title', 'Public Visibility Event')->firstOrFail();

        // Logout to simulate guest
        auth()->logout();

        $index = $this->get(route('events.index'));
        $index->assertStatus(200);
        $index->assertJsonFragment(['showOrganisers' => false]);

        $show = $this->get(route('events.show', $event));
        $show->assertStatus(200);
        $show->assertJsonFragment(['showOrganisers' => false]);
    }

    public function test_authenticated_users_see_organisers(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('events.store'), [
            'title' => 'Auth Visibility Event',
            'start_at' => now()->addDay()->toDateString(),
            'city' => 'Vienna',
            'organiser_id' => Organiser::create(['name' => 'Org Auth', 'email' => 'auth@example.test', 'active' => true])->id,
            'organiser_emails' => 'alice2@example.test,bob2@example.test',
            'image' => UploadedFile::fake()->image('event.jpg', 1200, 800),
            'tickets' => [
                ['name' => 'Standard', 'price' => 0, 'quantity_total' => 10],
            ],
        ]);

        $response->assertRedirect(route('events.index'));

        $event = Event::where('title', 'Auth Visibility Event')->firstOrFail();

        EventTicketController::query()->create([
            'event_id' => $event->id,
            'email' => 'scanner-auth@example.test',
        ]);

        $index = $this->get(route('events.index'));
        $index->assertStatus(200);
        $index->assertJsonFragment(['showOrganisers' => true]);
        $index->assertJsonFragment(['email' => 'alice2@example.test']);

        $show = $this->get(route('events.show', $event));
        $show->assertStatus(200);
        $show->assertJsonFragment(['showOrganisers' => true]);
        $show->assertJsonFragment(['email' => 'alice2@example.test']);
        $show->assertJsonFragment(['email' => 'scanner-auth@example.test']);
    }

    public function test_guest_can_edit_event_via_signed_link_with_password(): void
    {
        Mail::fake();

        Storage::fake('public');

        $response = $this->post(route('events.store'), [
            'title' => 'Guest Event',
            'start_at' => now()->addDay()->toDateString(),
            'city' => 'Madrid',
            'image' => UploadedFile::fake()->image('event.jpg', 1200, 800),
            'organiser_name' => 'Guest Org',
            'organiser_email' => 'guest@org.test',
            'edit_password' => 'secret123',
            'tickets' => [
                ['name' => 'Standard', 'price' => 0, 'quantity_total' => 10],
            ],
        ]);

        $response->assertRedirect(route('events.index'));

        $event = Event::firstOrFail();
        $promoter = User::factory()->create([
            'is_super_admin' => false,
            'active' => true,
            'role' => 'user',
        ]);
        $vendor = Vendor::factory()->create(['active' => true]);
        $artist = Artist::factory()->create(['active' => true]);

        $this->assertNotNull($event->edit_token);
        $signedUpdateUrl = URL::signedRoute('events.update-link', [
            'event' => $event->slug,
            'token' => $event->edit_token,
        ]);

        $update = $this->put($signedUpdateUrl, [
            'title' => 'Updated via link',
            'start_at' => now()->addDays(2)->toDateString(),
            'city' => 'Madrid',
            'promoter_ids' => [$promoter->id],
            'vendor_ids' => [$vendor->id],
            'artist_ids' => [$artist->id],
            'edit_password' => 'secret123',
        ]);

        $event->refresh();

        $signedEditUrl = URL::signedRoute('events.edit-link', [
            'event' => $event->slug,
            'token' => $event->edit_token,
        ]);

        $update->assertRedirect($signedEditUrl);
        $this->assertSame('Updated via link', $event->title);
        $this->assertTrue($event->promoters()->whereKey($promoter->id)->exists());
        $this->assertTrue($event->vendors()->whereKey($vendor->id)->exists());
        $this->assertTrue($event->artists()->whereKey($artist->id)->exists());

        Mail::assertSent(EventOrganiserCreated::class);
    }

    public function test_organiser_cannot_use_their_link_on_another_event(): void
    {
        $eventA = Event::factory()->create([
            'slug' => 'event-a',
            'edit_token' => 'token-a',
            'edit_token_expires_at' => null,
        ]);

        $eventB = Event::factory()->create([
            'slug' => 'event-b',
            'edit_token' => 'token-b',
            'edit_token_expires_at' => null,
        ]);

        $linkForA = URL::signedRoute('events.edit-link', [
            'event' => $eventA->slug,
            'token' => $eventA->edit_token,
        ]);

        // Tamper the link to point to event B but keep token/signature from event A.
        $tampered = str_replace('/event-a/', '/event-b/', $linkForA);

        $resp = $this->get($tampered);
        $resp->assertStatus(403);
    }
}

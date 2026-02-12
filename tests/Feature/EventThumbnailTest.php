<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EventThumbnailTest extends TestCase
{
    use RefreshDatabase;

    public function test_uploading_image_generates_thumbnail(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $this->actingAs($user);

        $organiserId = \App\Models\Organiser::create([
            'name' => 'Thumb Org',
            'email' => 'thumb@example.test',
            'active' => true,
        ])->id;

        $file = UploadedFile::fake()->image('large.jpg', 1200, 800);

        $response = $this->post(route('events.store'), [
            'title' => 'Thumb Event',
            'description' => 'With image',
            'start_at' => now()->addDay()->toDateString(),
            'end_at' => now()->addDays(2)->toDateString(),
            'city' => 'Zurich',
            'organiser_id' => $organiserId,
            'image' => $file,
            'tickets' => [
                ['name' => 'Standard', 'price' => 0, 'quantity_total' => 10],
            ],
        ]);

        $response->assertRedirect(route('events.index'));

        $event = Event::where('title', 'Thumb Event')->firstOrFail();

        $this->assertNotNull($event->image, 'Expected event->image to be set');
        $this->assertNotNull($event->image_thumbnail, 'Expected image_thumbnail to be set');

        Storage::disk('public')->assertExists($event->image);
        Storage::disk('public')->assertExists($event->image_thumbnail);

        $path = Storage::disk('public')->path($event->image);
        $this->assertFileExists($path);
        $size = getimagesize($path);
        $this->assertIsArray($size);
        $this->assertLessThanOrEqual(500, $size[1]);
    }

    public function test_uploading_small_image_does_not_upscale(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $this->actingAs($user);

        $organiserId = \App\Models\Organiser::create([
            'name' => 'Small Org',
            'email' => 'small@example.test',
            'active' => true,
        ])->id;

        $file = UploadedFile::fake()->image('small.jpg', 600, 300);

        $response = $this->post(route('events.store'), [
            'title' => 'Small Image Event',
            'description' => 'Small image should remain',
            'start_at' => now()->addDay()->toDateString(),
            'end_at' => now()->addDays(2)->toDateString(),
            'city' => 'Zurich',
            'organiser_id' => $organiserId,
            'image' => $file,
            'tickets' => [
                ['name' => 'Standard', 'price' => 0, 'quantity_total' => 10],
            ],
        ]);

        $response->assertRedirect(route('events.index'));

        $event = Event::where('title', 'Small Image Event')->firstOrFail();

        $path = Storage::disk('public')->path($event->image);
        $this->assertFileExists($path);
        $size = getimagesize($path);
        $this->assertIsArray($size);
        $this->assertSame(300, $size[1]);
    }

    public function test_event_requires_an_image_on_create(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $this->actingAs($user);

        $organiserId = \App\Models\Organiser::create([
            'name' => 'No Image Org',
            'email' => 'noimg@example.test',
            'active' => true,
        ])->id;

        $response = $this->post(route('events.store'), [
            'title' => 'No Image Event',
            'start_at' => now()->addDay()->toDateString(),
            'end_at' => now()->addDays(2)->toDateString(),
            'city' => 'Oslo',
            'organiser_id' => $organiserId,
            'tickets' => [
                ['name' => 'Standard', 'price' => 0, 'quantity_total' => 10],
            ],
        ]);

        $response->assertSessionHasErrors('image');
    }
}

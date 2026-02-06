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

        $file = UploadedFile::fake()->image('large.jpg', 1200, 800);

        $response = $this->post(route('events.store'), [
            'title' => 'Thumb Event',
            'description' => 'With image',
            'start_at' => now()->addDay()->toDateString(),
            'end_at' => now()->addDays(2)->toDateString(),
            'image' => $file,
        ]);

        $response->assertRedirect(route('events.index'));

        $event = Event::where('title', 'Thumb Event')->firstOrFail();

        $this->assertNotNull($event->image, 'Expected event->image to be set');
        $this->assertNotNull($event->image_thumbnail, 'Expected image_thumbnail to be set');

        Storage::disk('public')->assertExists($event->image);
        Storage::disk('public')->assertExists($event->image_thumbnail);
    }

    public function test_event_without_image_returns_null_image_fields_and_frontend_should_use_default(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('events.store'), [
            'title' => 'No Image Event',
            'description' => 'No image here',
            'start_at' => now()->addDay()->toDateString(),
            'end_at' => now()->addDays(2)->toDateString(),
        ]);

        $response->assertRedirect(route('events.index'));

        $event = Event::where('title', 'No Image Event')->firstOrFail();

        $this->assertNull($event->image);
        $this->assertNull($event->image_thumbnail);

        // In test environment the controller returns JSON for the event; frontend uses these nulls
        // to display the default image (`/images/default-event.svg`). Assert the API shape.
        $show = $this->get(route('events.show', $event));
        $show->assertJson(['event' => ['id' => $event->id, 'image' => null, 'image_thumbnail' => null]]);
    }
}

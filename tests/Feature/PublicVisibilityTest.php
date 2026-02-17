<?php

namespace Tests\Feature;

use App\Models\Agency;
use App\Models\Artist;
use App\Models\Organiser;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicVisibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_public_artist_promoter_vendor_and_organiser_directories(): void
    {
        $artist = Artist::factory()->create(['active' => true]);
        $vendor = Vendor::factory()->create(['active' => true]);
        $organiser = Organiser::query()->create([
            'name' => 'Public Organiser',
            'email' => 'organiser@example.com',
            'active' => true,
        ]);
        $promoter = User::factory()->create([
            'role' => 'user',
            'active' => true,
            'is_super_admin' => false,
        ]);

        $this->get(route('artists.index'))
            ->assertStatus(200)
            ->assertJsonFragment(['name' => $artist->name]);

        $this->get(route('vendors.index'))
            ->assertStatus(200)
            ->assertJsonFragment(['name' => $vendor->name]);

        $this->get(route('organisers.index'))
            ->assertStatus(200)
            ->assertJsonFragment(['name' => $organiser->name]);

        $this->get(route('promoters.index'))
            ->assertStatus(200)
            ->assertJsonFragment(['name' => $promoter->name]);
    }

    public function test_guest_can_view_public_show_pages_for_agency_organiser_artist_promoter_and_vendor(): void
    {
        $agency = Agency::query()->create([
            'name' => 'Public Agency',
            'email' => 'agency@example.test',
            'active' => true,
        ]);

        $organiser = Organiser::query()->create([
            'name' => 'Public Organiser',
            'email' => 'organiser-show@example.com',
            'active' => true,
            'agency_id' => $agency->id,
        ]);

        $artist = Artist::factory()->create([
            'active' => true,
            'agency_id' => $agency->id,
        ]);

        $promoter = User::factory()->create([
            'role' => 'user',
            'active' => true,
            'is_super_admin' => false,
            'agency_id' => $agency->id,
        ]);

        $vendor = Vendor::factory()->create([
            'active' => true,
            'agency_id' => $agency->id,
        ]);

        $this->get(route('agencies.index'))
            ->assertStatus(200)
            ->assertJsonFragment(['name' => $agency->name]);

        $this->get(route('agencies.show', $agency))->assertStatus(200);
        $this->get(route('organisers.show', $organiser))->assertStatus(200);
        $this->get(route('artists.show', $artist))->assertStatus(200);
        $this->get(route('promoters.show', $promoter))->assertStatus(200);
        $this->get(route('vendors.show', $vendor))->assertStatus(200);
    }
}

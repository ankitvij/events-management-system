<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Artist;
use App\Models\ArtistAvailability;
use App\Models\BookingRequest;
use App\Models\Customer;
use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Organiser;
use App\Models\Page;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorAvailability;
use App\Models\VendorBookingRequest;
use App\Models\VendorEquipment;
use App\Models\VendorService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EverythingSampleSeeder extends Seeder
{
    /**
     * Seed broad sample data across all main modules.
     */
    public function run(): void
    {
        if (! config('seeding.allow_sample_data')) {
            $this->command?->warn('Skipping EverythingSampleSeeder because ALLOW_SAMPLE_SEEDING is disabled.');

            return;
        }

        if (app()->environment('production')) {
            $this->command?->warn('Skipping EverythingSampleSeeder in production environment.');

            return;
        }

        [$eventImagePath, $artistPhotoPath] = $this->ensureSeedImages();

        $admin = User::query()->firstOrCreate(
            ['email' => 'admin@example.test'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => Role::ADMIN->value,
                'is_super_admin' => false,
                'active' => true,
            ]
        );

        $superAdmin = User::query()->firstOrCreate(
            ['email' => 'superadmin@example.test'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => Role::SUPER_ADMIN->value,
                'is_super_admin' => true,
                'active' => true,
            ]
        );

        $promoters = User::factory()->count(8)->create([
            'role' => Role::USER->value,
            'is_super_admin' => false,
            'active' => true,
        ]);

        $users = User::factory()->count(8)->create([
            'role' => Role::USER->value,
            'is_super_admin' => false,
            'active' => true,
        ]);

        $customers = Customer::factory()->count(10)->create(['active' => true]);

        $organisers = collect();
        for ($index = 1; $index <= 10; $index++) {
            $organisers->push(Organiser::query()->create([
                'name' => fake()->company().' Organiser '.$index,
                'email' => fake()->unique()->companyEmail(),
                'active' => true,
            ]));
        }

        $artists = Artist::factory()->count(12)->create([
            'active' => true,
            'photo' => $artistPhotoPath,
            'artist_types' => ['performer', 'dj'],
        ]);

        foreach ($artists as $artist) {
            for ($offset = 0; $offset < 5; $offset++) {
                ArtistAvailability::query()->create([
                    'artist_id' => $artist->id,
                    'date' => now()->addDays($offset + 1)->toDateString(),
                    'is_available' => true,
                ]);
            }
        }

        $vendors = Vendor::factory()->count(12)->create(['active' => true]);

        foreach ($vendors as $vendor) {
            for ($offset = 0; $offset < 5; $offset++) {
                VendorAvailability::query()->create([
                    'vendor_id' => $vendor->id,
                    'date' => now()->addDays($offset + 1)->toDateString(),
                    'is_available' => true,
                ]);
            }

            VendorEquipment::factory()->count(3)->create([
                'vendor_id' => $vendor->id,
            ]);

            VendorService::factory()->count(3)->create([
                'vendor_id' => $vendor->id,
            ]);
        }

        $events = collect();

        for ($index = 1; $index <= 18; $index++) {
            $owner = $users->random();
            $mainOrganiser = $organisers->random();
            $title = fake()->unique()->sentence(3).' #'.$index;

            $event = Event::factory()->create([
                'title' => $title,
                'slug' => Str::slug($title).'-'.Str::lower(Str::random(6)),
                'city' => fake()->city(),
                'country' => fake()->country(),
                'address' => fake()->streetAddress(),
                'user_id' => $owner->id,
                'active' => true,
                'organiser_id' => $mainOrganiser->id,
                'image' => $eventImagePath,
                'image_thumbnail' => $eventImagePath,
            ]);

            $event->organisers()->sync(
                $organisers->random(fake()->numberBetween(1, 3))->pluck('id')->all()
            );

            $event->promoters()->sync(
                $promoters->random(fake()->numberBetween(1, 3))->pluck('id')->all()
            );

            $linkedArtists = $artists->random(fake()->numberBetween(2, 4));
            $event->artists()->sync($linkedArtists->pluck('id')->all());

            $linkedVendors = $vendors->random(fake()->numberBetween(2, 4));
            $event->vendors()->sync($linkedVendors->pluck('id')->all());

            for ($ticketIndex = 1; $ticketIndex <= fake()->numberBetween(2, 4); $ticketIndex++) {
                $quantityTotal = fake()->numberBetween(50, 350);
                $quantityAvailable = fake()->numberBetween(0, $quantityTotal);

                Ticket::query()->create([
                    'event_id' => $event->id,
                    'name' => 'Ticket '.$ticketIndex,
                    'price' => fake()->randomFloat(2, 15, 180),
                    'quantity_total' => $quantityTotal,
                    'quantity_available' => $quantityAvailable,
                    'active' => true,
                ]);
            }

            foreach ($linkedArtists->take(2) as $artist) {
                $status = fake()->randomElement([
                    BookingRequest::STATUS_PENDING,
                    BookingRequest::STATUS_ACCEPTED,
                    BookingRequest::STATUS_DECLINED,
                ]);

                $bookingRequest = BookingRequest::factory()->create([
                    'event_id' => $event->id,
                    'artist_id' => $artist->id,
                    'requested_by_user_id' => $owner->id,
                    'status' => $status,
                    'responded_at' => $status === BookingRequest::STATUS_PENDING ? null : now()->subDays(fake()->numberBetween(1, 10)),
                ]);

                if ($bookingRequest->status === BookingRequest::STATUS_ACCEPTED) {
                    $event->artists()->syncWithoutDetaching([$artist->id]);
                }
            }

            foreach ($linkedVendors->take(2) as $vendor) {
                $status = fake()->randomElement([
                    VendorBookingRequest::STATUS_PENDING,
                    VendorBookingRequest::STATUS_ACCEPTED,
                    VendorBookingRequest::STATUS_DECLINED,
                ]);

                $vendorBookingRequest = VendorBookingRequest::factory()->create([
                    'event_id' => $event->id,
                    'vendor_id' => $vendor->id,
                    'requested_by_user_id' => $owner->id,
                    'status' => $status,
                    'responded_at' => $status === VendorBookingRequest::STATUS_PENDING ? null : now()->subDays(fake()->numberBetween(1, 10)),
                ]);

                if ($vendorBookingRequest->status === VendorBookingRequest::STATUS_ACCEPTED) {
                    $event->vendors()->syncWithoutDetaching([
                        $vendor->id => ['vendor_booking_request_id' => $vendorBookingRequest->id],
                    ]);
                }
            }

            $events->push($event);
        }

        for ($orderIndex = 1; $orderIndex <= 20; $orderIndex++) {
            $event = $events->random();
            $ticket = Ticket::query()->where('event_id', $event->id)->inRandomOrder()->first();
            $customer = $customers->random();
            $quantity = fake()->numberBetween(1, 3);

            if (! $ticket) {
                continue;
            }

            $order = Order::factory()->create([
                'customer_id' => $customer->id,
                'user_id' => $event->user_id,
                'payment_method' => fake()->randomElement(['bank_transfer', 'paypal', 'cash']),
                'payment_status' => fake()->randomElement(['pending', 'paid']),
                'paid' => fake()->boolean(70),
                'checked_in' => fake()->boolean(25),
                'status' => fake()->randomElement(['confirmed', 'pending']),
                'total' => (float) $ticket->price * $quantity,
                'contact_name' => $customer->name,
                'contact_email' => $customer->email,
            ]);

            OrderItem::factory()->create([
                'order_id' => $order->id,
                'ticket_id' => $ticket->id,
                'event_id' => $event->id,
                'quantity' => $quantity,
                'price' => $ticket->price,
                'guest_details' => collect(range(1, $quantity))->map(fn () => [
                    'name' => fake()->name(),
                    'email' => fake()->safeEmail(),
                ])->all(),
            ]);
        }

        Page::query()->updateOrCreate(
            ['slug' => 'about'],
            ['title' => 'About', 'content' => '<p>Sample about page content.</p>', 'active' => true, 'user_id' => $admin->id]
        );

        Page::query()->updateOrCreate(
            ['slug' => 'privacy-policy'],
            ['title' => 'Privacy Policy', 'content' => '<p>Sample privacy policy content.</p>', 'active' => true, 'user_id' => $superAdmin->id]
        );
    }

    /**
     * @return array{0: ?string, 1: ?string}
     */
    private function ensureSeedImages(): array
    {
        $eventImagePath = null;
        $artistPhotoPath = null;

        $eventSource = base_path('public_html/images/default-event.svg');
        $artistSource = base_path('public_html/images/logo.png');

        if (is_file($eventSource)) {
            Storage::disk('public')->put('seed/default-event.svg', file_get_contents($eventSource));
            $eventImagePath = 'seed/default-event.svg';
        }

        if (is_file($artistSource)) {
            Storage::disk('public')->put('seed/artist-logo.png', file_get_contents($artistSource));
            $artistPhotoPath = 'seed/artist-logo.png';
        }

        if (! $artistPhotoPath && $eventImagePath) {
            $artistPhotoPath = $eventImagePath;
        }

        return [$eventImagePath, $artistPhotoPath];
    }
}

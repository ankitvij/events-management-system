<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class EventsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn('Skipping EventsTableSeeder in production environment.');

            return;
        }

        $user = User::where('email', 'test@example.com')->first();

        if (! $user) {
            $user = User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }

        $now = Carbon::now();

        $samples = [
            [
                'title' => 'Community Meetup: Laravel Tips',
                'description' => 'An informal meetup to share tips and tricks for Laravel development.',
                'start_at' => $now->copy()->addDays(3)->setTime(18, 0),
                'end_at' => $now->copy()->addDays(3)->setTime(20, 0),
                'address' => 'City Library Conference Room',
                'city' => 'Berlin',
                'country' => 'Germany',
            ],
            [
                'title' => 'Product Launch Planning',
                'description' => 'Planning session for the upcoming product launch.',
                'start_at' => $now->copy()->addDays(7)->setTime(10, 0),
                'end_at' => $now->copy()->addDays(7)->setTime(12, 0),
                'address' => 'Office - Meeting Room A',
                'city' => 'Munich',
                'country' => 'Germany',
            ],
            [
                'title' => 'Design Review',
                'description' => 'Review of the new UI designs with the product and design teams.',
                'start_at' => $now->copy()->addDays(10)->setTime(14, 0),
                'end_at' => $now->copy()->addDays(10)->setTime(15, 30),
                'address' => 'Remote - Zoom',
                'city' => 'Remote',
                'country' => null,
            ],
            [
                'title' => 'Quarterly All-Hands',
                'description' => 'Company-wide update and Q&A with leadership.',
                'start_at' => $now->copy()->addDays(14)->setTime(9, 30),
                'end_at' => $now->copy()->addDays(14)->setTime(11, 0),
                'address' => 'Main Auditorium',
                'city' => 'Hamburg',
                'country' => 'Germany',
            ],
            [
                'title' => 'Hackathon Kickoff',
                'description' => 'Kickoff for the internal 48-hour hackathon — form teams and start building.',
                'start_at' => $now->copy()->addDays(21)->setTime(17, 0),
                'end_at' => $now->copy()->addDays(23)->setTime(17, 0),
                'address' => 'Office - Open Space',
                'city' => 'Frankfurt',
                'country' => 'Germany',
            ],
        ];

        foreach ($samples as $data) {
            Event::create(array_merge($data, ['user_id' => $user->id]));
        }
    }
}

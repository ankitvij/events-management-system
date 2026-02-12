<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;

class TicketsSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn('Skipping TicketsSeeder in production environment.');

            return;
        }

        $events = Event::query()->limit(30)->get();

        foreach ($events as $event) {
            $event->tickets()->createMany([
                [
                    'name' => 'General Admission',
                    'price' => 10.00,
                    'quantity_total' => 100,
                    'quantity_available' => 100,
                    'active' => true,
                ],
                [
                    'name' => 'VIP',
                    'price' => 35.00,
                    'quantity_total' => 20,
                    'quantity_available' => 20,
                    'active' => true,
                ],
            ]);
        }
    }
}

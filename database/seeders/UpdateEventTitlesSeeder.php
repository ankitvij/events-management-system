<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;

class UpdateEventTitlesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn('Skipping UpdateEventTitlesSeeder in production environment.');

            return;
        }

        $samples = [
            'Hamburg Salsa Gala',
            'Amsterdam Techno Rave',
            'Berlin Open Air Festival',
            'Munich Summer Carnival',
            'Paris Jazz Nights',
            'London Street Food Festival',
            'Madrid Flamenco Fiesta',
            'New York Rooftop Party',
            'Los Angeles Beach Bash',
            'Sydney Harbour Music Fest',
            'Toronto Cultural Expo',
            'Dublin Indie Weekender',
            'Lisbon Sunset Sessions',
            'Brussels Electronic Fair',
            'Prague Classical Gala',
            'Stockholm Winter Market',
            'Oslo Northern Lights Festival',
            'Copenhagen Hygge Gathering',
            'Barcelona Urban Beats',
            'Milan Fashion Afterparty',
            'Zurich Lakeside Concert',
            'Vienna Opera Soiree',
            'Budapest Ruin Bar Fest',
            'Warsaw Folk Festival',
            'Athens Cultural Parade',
            'Istanbul Night Bazaar',
            'Helsinki Sauna Party',
            'Reykjavik Midnight Rave',
            'Krakow Historic Festival',
            'Edinburgh Fringe Afterparty',
            'Bern Chocolate Carnival',
            'Valencia Paella Fest',
            'Seville Feria de Abril',
            'Porto Wine & Music',
            'Bergen Fjord Concert',
            'Gothenburg Pop Meetup',
            'Leeds Indie Carnival',
            'Bordeaux Vineyard Gala',
            'Naples Street Opera',
            'Marseille Coastal Fest',
        ];

        $events = Event::orderBy('id', 'desc')->take(count($samples))->get();
        $i = 0;
        foreach ($events as $event) {
            $event->title = $samples[$i % count($samples)];
            $event->save();
            $i++;
        }
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Event;
use App\Models\User;

class EventsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('event_organiser')->truncate();
        Event::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $user = User::orderBy('id')->first();
        $userId = $user ? $user->id : 1;

        // Create 30 curated, realistic events (festivals, conferences, cultural events)
        $baseDate = now();

        $samples = [
            ['title' => 'Sunset Techno Festival', 'city' => 'Berlin', 'country' => 'Germany', 'location' => 'Tempelhof Field', 'address' => 'Tempelhofer Feld, 12099 Berlin', 'days' => 3, 'offset' => 5],
            ['title' => 'Lisbon Salsa & Bachata Festival', 'city' => 'Lisbon', 'country' => 'Portugal', 'location' => 'Altice Arena', 'address' => 'Av. Marechal Craveiro Lopes, 1990-034 Lisboa', 'days' => 4, 'offset' => 12],
            ['title' => 'Mumbai Cultural Carnival', 'city' => 'Mumbai', 'country' => 'India', 'location' => 'Marine Drive Grounds', 'address' => 'Marine Dr, Mumbai', 'days' => 2, 'offset' => 20],
            ['title' => 'Tokyo Nightbeat Electronic Weekend', 'city' => 'Tokyo', 'country' => 'Japan', 'location' => 'Odaiba Seaside Park', 'address' => 'Daiba, Minato City, Tokyo', 'days' => 2, 'offset' => 28],
            ['title' => 'Barcelona Spring Arts Festival', 'city' => 'Barcelona', 'country' => 'Spain', 'location' => 'Montjuïc', 'address' => 'Parc de Montjuïc, Barcelona', 'days' => 5, 'offset' => 35],
            ['title' => 'New Orleans Jazz & Blues Weekend', 'city' => 'New Orleans', 'country' => 'USA', 'location' => 'French Quarter Stage', 'address' => 'Bourbon St, New Orleans', 'days' => 3, 'offset' => 42],
            ['title' => 'Sydney Open Air Music Fest', 'city' => 'Sydney', 'country' => 'Australia', 'location' => 'Hyde Park', 'address' => 'Hyde Park, Sydney', 'days' => 1, 'offset' => 50],
            ['title' => 'Amsterdam Open Data Summit', 'city' => 'Amsterdam', 'country' => 'Netherlands', 'location' => 'RAI Amsterdam', 'address' => 'Europaplein 24, 1078 GZ Amsterdam', 'days' => 2, 'offset' => 58],
            ['title' => 'São Paulo Carnival Afterparty', 'city' => 'São Paulo', 'country' => 'Brazil', 'location' => 'Anhembi Park', 'address' => 'Av. Olavo Fontoura, 1.209 - Santana, São Paulo', 'days' => 3, 'offset' => 66],
            ['title' => 'London Hackathon Weekend', 'city' => 'London', 'country' => 'UK', 'location' => 'The Trampery', 'address' => 'Shoreditch, London', 'days' => 2, 'offset' => 75],
            ['title' => 'Paris Fashion & Streetwear Expo', 'city' => 'Paris', 'country' => 'France', 'location' => 'Le Palais', 'address' => 'Paris Centre', 'days' => 2, 'offset' => 82],
            ['title' => 'Cape Town Coastal Food Festival', 'city' => 'Cape Town', 'country' => 'South Africa', 'location' => 'V&A Waterfront', 'address' => 'Victoria & Alfred Waterfront, Cape Town', 'days' => 2, 'offset' => 90],
            ['title' => 'Lisbon Tech Startups Meetup', 'city' => 'Lisbon', 'country' => 'Portugal', 'location' => 'LX Factory', 'address' => 'Rua Rodrigues de Faria 103, Lisboa', 'days' => 1, 'offset' => 98],
            ['title' => 'Prague Classical Music Series', 'city' => 'Prague', 'country' => 'Czech Republic', 'location' => 'Rudolfinum', 'address' => 'Alšovo nábř. 12, 110 00 Praha 1', 'days' => 3, 'offset' => 105],
            ['title' => 'Rome Open-Air Cinema Festival', 'city' => 'Rome', 'country' => 'Italy', 'location' => 'Villa Borghese', 'address' => 'Piazza di Siena, Rome', 'days' => 10, 'offset' => 112],
            ['title' => 'Berlin Indie Rock Night', 'city' => 'Berlin', 'country' => 'Germany', 'location' => 'Club Tresor', 'address' => 'Köpenicker Str. 70, Berlin', 'days' => 1, 'offset' => 120],
            ['title' => 'Lisbon Fado & Culture Weekend', 'city' => 'Lisbon', 'country' => 'Portugal', 'location' => 'Alfama Quarter', 'address' => 'Alfama, Lisboa', 'days' => 2, 'offset' => 128],
            ['title' => 'Buenos Aires Tango Festival', 'city' => 'Buenos Aires', 'country' => 'Argentina', 'location' => 'La Boca', 'address' => 'Caminito, La Boca', 'days' => 4, 'offset' => 136],
            ['title' => 'Toronto Film Expo', 'city' => 'Toronto', 'country' => 'Canada', 'location' => 'TIFF Bell Lightbox', 'address' => '350 King St W, Toronto', 'days' => 7, 'offset' => 144],
            ['title' => 'Mumbai Street Food Festival', 'city' => 'Mumbai', 'country' => 'India', 'location' => 'Juhu Beach', 'address' => 'Juhu Beach, Mumbai', 'days' => 2, 'offset' => 152],
            ['title' => 'Seoul K-Pop Fan Meet', 'city' => 'Seoul', 'country' => 'South Korea', 'location' => 'Olympic Park', 'address' => 'Olympic-ro, Songpa-gu, Seoul', 'days' => 1, 'offset' => 160],
            ['title' => 'Reykjavík Northern Lights Weekend', 'city' => 'Reykjavík', 'country' => 'Iceland', 'location' => 'Perlan', 'address' => 'Öskjuhlíð, Reykjavík', 'days' => 3, 'offset' => 168],
            ['title' => 'Lisbon Electronic Beach Party', 'city' => 'Lisbon', 'country' => 'Portugal', 'location' => 'Costa da Caparica', 'address' => 'Costa da Caparica, Almada', 'days' => 2, 'offset' => 176],
            ['title' => 'Amsterdam Bicycle City Festival', 'city' => 'Amsterdam', 'country' => 'Netherlands', 'location' => 'Vondelpark', 'address' => 'Vondelpark, Amsterdam', 'days' => 1, 'offset' => 184],
            ['title' => 'Hong Kong Harbour Music Night', 'city' => 'Hong Kong', 'country' => 'China', 'location' => 'Victoria Harbour', 'address' => 'Victoria Harbour, Hong Kong', 'days' => 1, 'offset' => 192],
            ['title' => 'Lisbon Coffee & Arts Fair', 'city' => 'Lisbon', 'country' => 'Portugal', 'location' => 'Campo Pequeno', 'address' => 'Campo Pequeno, Lisboa', 'days' => 2, 'offset' => 200],
            ['title' => 'San Francisco Sustainability Summit', 'city' => 'San Francisco', 'country' => 'USA', 'location' => 'Moscone Center', 'address' => '747 Howard St, San Francisco', 'days' => 3, 'offset' => 208],
            ['title' => 'Istanbul Bosphorus Arts Festival', 'city' => 'Istanbul', 'country' => 'Turkey', 'location' => 'Ortaköy Square', 'address' => 'Ortaköy, Istanbul', 'days' => 2, 'offset' => 216],
            ['title' => 'Mexico City Día de los Muertos Parade', 'city' => 'Mexico City', 'country' => 'Mexico', 'location' => 'Centro Histórico', 'address' => 'Zócalo, Mexico City', 'days' => 1, 'offset' => 224],
            ['title' => 'Berlin Street Food Market', 'city' => 'Berlin', 'country' => 'Germany', 'location' => 'Markthalle Neun', 'address' => 'Eisenbahnstr. 42/43, 10997 Berlin', 'days' => 1, 'offset' => 232],
        ];

        foreach ($samples as $i => $s) {
            $start = $baseDate->copy()->addDays($s['offset'])->setTime(18, 0);
            $end = $start->copy()->addDays($s['days'])->setTime(23, 0);

            $event = Event::create([
                'title' => $s['title'],
                'description' => $s['title'] . ' — A multi-day event featuring local and international artists, food and community programming.',
                'start_at' => $start,
                'end_at' => $end,
                'location' => $s['location'],
                'city' => $s['city'],
                'address' => $s['address'],
                'country' => $s['country'],
                'image' => null,
                'image_thumbnail' => null,
                'user_id' => $userId,
                'organiser_id' => $userId,
                'active' => 1,
            ]);

            DB::table('event_organiser')->insert([
                'event_id' => $event->id,
                'organiser_id' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

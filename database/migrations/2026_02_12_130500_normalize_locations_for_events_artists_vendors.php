<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120)->unique();
            $table->string('code', 2)->nullable()->unique();
            $table->timestamps();
        });

        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->foreignId('country_id')->nullable()->constrained('countries')->nullOnDelete();
            $table->timestamps();
            $table->unique(['name', 'country_id']);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->foreignId('country_id')->nullable()->after('country')->constrained('countries')->nullOnDelete();
            $table->foreignId('city_id')->nullable()->after('city')->constrained('cities')->nullOnDelete();
        });

        Schema::table('artists', function (Blueprint $table) {
            $table->foreignId('country_id')->nullable()->after('city')->constrained('countries')->nullOnDelete();
            $table->foreignId('city_id')->nullable()->after('city')->constrained('cities')->nullOnDelete();
        });

        Schema::table('vendors', function (Blueprint $table) {
            $table->foreignId('country_id')->nullable()->after('city')->constrained('countries')->nullOnDelete();
            $table->foreignId('city_id')->nullable()->after('city')->constrained('cities')->nullOnDelete();
        });

        $countryIds = [];
        $cityIds = [];

        $normalize = static function (?string $value): ?string {
            if ($value === null) {
                return null;
            }

            $trimmed = trim($value);
            if ($trimmed === '') {
                return null;
            }

            return preg_replace('/\s+/', ' ', $trimmed) ?: null;
        };

        $resolveCountryId = static function (?string $countryName) use (&$countryIds, $normalize): ?int {
            $normalized = $normalize($countryName);
            if ($normalized === null) {
                return null;
            }

            if (array_key_exists($normalized, $countryIds)) {
                return $countryIds[$normalized];
            }

            $existing = DB::table('countries')->where('name', $normalized)->first();
            if ($existing) {
                $countryIds[$normalized] = (int) $existing->id;

                return (int) $existing->id;
            }

            $id = DB::table('countries')->insertGetId([
                'name' => $normalized,
                'code' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $countryIds[$normalized] = (int) $id;

            return (int) $id;
        };

        $resolveCityId = static function (?string $cityName, ?int $countryId) use (&$cityIds, $normalize): ?int {
            $normalized = $normalize($cityName);
            if ($normalized === null) {
                return null;
            }

            $key = $normalized.'|'.($countryId === null ? 'null' : (string) $countryId);
            if (array_key_exists($key, $cityIds)) {
                return $cityIds[$key];
            }

            $query = DB::table('cities')->where('name', $normalized);
            if ($countryId === null) {
                $query->whereNull('country_id');
            } else {
                $query->where('country_id', $countryId);
            }

            $existing = $query->first();
            if ($existing) {
                $cityIds[$key] = (int) $existing->id;

                return (int) $existing->id;
            }

            $id = DB::table('cities')->insertGetId([
                'name' => $normalized,
                'country_id' => $countryId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $cityIds[$key] = (int) $id;

            return (int) $id;
        };

        $events = DB::table('events')->select('id', 'country', 'city')->get();
        foreach ($events as $event) {
            $countryId = $resolveCountryId($event->country);
            $cityId = $resolveCityId($event->city, $countryId);

            DB::table('events')->where('id', $event->id)->update([
                'country_id' => $countryId,
                'city_id' => $cityId,
            ]);
        }

        $artists = DB::table('artists')->select('id', 'city')->get();
        foreach ($artists as $artist) {
            $cityName = $normalize($artist->city);
            if ($cityName === null) {
                continue;
            }

            $knownCity = DB::table('cities')
                ->where('name', $cityName)
                ->orderByRaw('CASE WHEN country_id IS NULL THEN 1 ELSE 0 END')
                ->first();

            $cityId = $knownCity ? (int) $knownCity->id : $resolveCityId($cityName, null);
            $countryId = $knownCity ? ($knownCity->country_id !== null ? (int) $knownCity->country_id : null) : null;

            DB::table('artists')->where('id', $artist->id)->update([
                'city_id' => $cityId,
                'country_id' => $countryId,
            ]);
        }

        $vendors = DB::table('vendors')->select('id', 'city')->get();
        foreach ($vendors as $vendor) {
            $cityName = $normalize($vendor->city);
            if ($cityName === null) {
                continue;
            }

            $knownCity = DB::table('cities')
                ->where('name', $cityName)
                ->orderByRaw('CASE WHEN country_id IS NULL THEN 1 ELSE 0 END')
                ->first();

            $cityId = $knownCity ? (int) $knownCity->id : $resolveCityId($cityName, null);
            $countryId = $knownCity ? ($knownCity->country_id !== null ? (int) $knownCity->country_id : null) : null;

            DB::table('vendors')->where('id', $vendor->id)->update([
                'city_id' => $cityId,
                'country_id' => $countryId,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->dropConstrainedForeignId('city_id');
            $table->dropConstrainedForeignId('country_id');
        });

        Schema::table('artists', function (Blueprint $table) {
            $table->dropConstrainedForeignId('city_id');
            $table->dropConstrainedForeignId('country_id');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropConstrainedForeignId('city_id');
            $table->dropConstrainedForeignId('country_id');
        });

        Schema::dropIfExists('cities');
        Schema::dropIfExists('countries');
    }
};

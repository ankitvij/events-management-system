<?php

namespace App\Services;

use App\Models\City;
use App\Models\Country;

class LocationResolver
{
    /**
     * @return array{country_id: int|null, city_id: int|null}
     */
    public function resolve(?string $cityName, ?string $countryName): array
    {
        $normalizedCity = $this->normalize($cityName);
        $normalizedCountry = $this->normalize($countryName);

        $countryId = null;
        if ($normalizedCountry !== null) {
            $country = Country::query()->firstOrCreate(
                ['name' => $normalizedCountry],
                ['code' => null]
            );
            $countryId = $country->id;
        }

        $cityId = null;
        if ($normalizedCity !== null) {
            if ($countryId !== null) {
                $city = City::query()->firstOrCreate([
                    'name' => $normalizedCity,
                    'country_id' => $countryId,
                ]);
                $cityId = $city->id;
            } else {
                $city = City::query()
                    ->where('name', $normalizedCity)
                    ->whereNull('country_id')
                    ->first();

                if (! $city) {
                    $city = City::query()->create([
                        'name' => $normalizedCity,
                        'country_id' => null,
                    ]);
                }

                $cityId = $city->id;
            }
        }

        return [
            'country_id' => $countryId,
            'city_id' => $cityId,
        ];
    }

    private function normalize(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);
        if ($trimmed === '') {
            return null;
        }

        return preg_replace('/\s+/', ' ', $trimmed) ?: null;
    }
}

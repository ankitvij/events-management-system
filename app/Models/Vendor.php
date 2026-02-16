<?php

namespace App\Models;

use App\Enums\VendorType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vendor extends Model
{
    /** @use HasFactory<\Database\Factories\VendorFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'type',
        'city',
        'city_id',
        'country_id',
        'agency_id',
        'description',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'type' => VendorType::class,
            'active' => 'boolean',
            'city_id' => 'integer',
            'country_id' => 'integer',
            'agency_id' => 'integer',
        ];
    }

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    public function countryRef(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id');
    }

    public function cityRef(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city_id');
    }

    public function availabilities(): HasMany
    {
        return $this->hasMany(VendorAvailability::class);
    }

    public function equipment(): HasMany
    {
        return $this->hasMany(VendorEquipment::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(VendorService::class);
    }

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'vendor_event')->withTimestamps();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Artist extends Model
{
    /** @use HasFactory<\Database\Factories\ArtistFactory> */
    use HasFactory;

    protected $appends = [
        'photo_url',
    ];

    protected $fillable = [
        'name',
        'email',
        'city',
        'experience_years',
        'skills',
        'description',
        'equipment',
        'photo',
        'active',
        'email_verified_at',
        'verify_token',
    ];

    protected $casts = [
        'active' => 'boolean',
        'experience_years' => 'integer',
        'email_verified_at' => 'datetime',
    ];

    public function getPhotoUrlAttribute(): ?string
    {
        if (! $this->photo) {
            return null;
        }

        $path = $this->photo;

        if (str_starts_with($path, '/storage/')) {
            return $path;
        }

        if (str_starts_with($path, 'storage/')) {
            return '/'.$path;
        }

        return Storage::url($path);
    }

    public function availabilities(): HasMany
    {
        return $this->hasMany(ArtistAvailability::class);
    }

    public function bookingRequests(): HasMany
    {
        return $this->hasMany(BookingRequest::class);
    }

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'artist_event')->withTimestamps();
    }
}

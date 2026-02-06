<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Storage;

class Event extends Model
{
    use HasFactory;

    protected $appends = [
        'image_url',
        'image_thumbnail_url',
    ];

    protected $fillable = [
        'title',
        'description',
        'start_at',
        'end_at',
        'city',
        'address',
        'facebook_url',
        'instagram_url',
        'whatsapp_url',
        'country',
        'image',
        'image_thumbnail',
        'user_id',
        'active',
        'organiser_id',
    ];

    protected $casts = [
        'start_at' => 'date',
        'end_at' => 'date',
        'active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function organiser(): BelongsTo
    {
        return $this->belongsTo(Organiser::class);
    }

    public function organisers(): BelongsToMany
    {
        return $this->belongsToMany(Organiser::class, 'event_organiser')->withTimestamps();
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    /**
     * Return a full URL for the image with cache-busting based on file mtime when available.
     */
    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image) {
            return null;
        }

        $path = $this->image;
        if (str_starts_with($path, '/storage/')) {
            $url = $path;
        } elseif (str_starts_with($path, 'storage/')) {
            $url = '/'.$path;
        } else {
            $url = Storage::url($path);
        }

        try {
            $file = Storage::disk('public')->path($path);
            if (file_exists($file)) {
                $ts = filemtime($file);

                return $url.(strpos($url, '?') === false ? '?' : '&').'v='.$ts;
            }
        } catch (\Throwable $e) {
            // ignore and return url without cache bust
        }

        return $url;
    }

    /**
     * Return a full URL for the thumbnail with cache-busting based on file mtime when available.
     */
    public function getImageThumbnailUrlAttribute(): ?string
    {
        if (! $this->image_thumbnail) {
            return null;
        }

        $path = $this->image_thumbnail;
        if (str_starts_with($path, '/storage/')) {
            $url = $path;
        } elseif (str_starts_with($path, 'storage/')) {
            $url = '/'.$path;
        } else {
            $url = Storage::url($path);
        }

        try {
            $file = Storage::disk('public')->path($path);
            if (file_exists($file)) {
                $ts = filemtime($file);

                return $url.(strpos($url, '?') === false ? '?' : '&').'v='.$ts;
            }
        } catch (\Throwable $e) {
            // ignore
        }

        return $url;
    }
}

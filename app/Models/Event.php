<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'start_at',
        'end_at',
        'location',
        'image',
        'image_thumbnail',
        'user_id',
        'active',
        'organiser_id',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
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
}

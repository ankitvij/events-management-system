<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventTicketController extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'email',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}

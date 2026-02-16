<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Organiser extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'agency_id',
        'active',
        'bank_account_name',
        'bank_iban',
        'bank_bic',
        'bank_reference_hint',
        'paypal_id',
        'revolut_id',
    ];

    protected $casts = [
        'agency_id' => 'integer',
        'active' => 'boolean',
    ];

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_organiser')->withTimestamps();
    }
}

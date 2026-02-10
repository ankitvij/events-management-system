<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Organiser extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'active',
        'bank_account_name',
        'bank_iban',
        'bank_bic',
        'bank_reference_hint',
        'bank_instructions',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_organiser')->withTimestamps();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'active',
        'password',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Hide sensitive attributes from array / JSON
     *
     * @var array
     */
    protected $hidden = [
        'password',
    ];

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}

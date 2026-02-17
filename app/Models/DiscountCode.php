<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DiscountCode extends Model
{
    /** @use HasFactory<\Database\Factories\DiscountCodeFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'created_by_user_id',
        'promoter_user_id',
        'organiser_id',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'created_by_user_id' => 'integer',
            'promoter_user_id' => 'integer',
            'organiser_id' => 'integer',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function promoter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'promoter_user_id');
    }

    public function organiser(): BelongsTo
    {
        return $this->belongsTo(Organiser::class);
    }

    public function discounts(): HasMany
    {
        return $this->hasMany(DiscountCodeTicket::class);
    }
}

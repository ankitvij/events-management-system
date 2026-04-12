<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StripeConnectProduct extends Model
{
    protected $fillable = [
        'stripe_connected_account_id',
        'created_by_user_id',
        'stripe_product_id',
        'stripe_price_id',
        'name',
        'description',
        'unit_amount',
        'currency',
    ];

    protected function casts(): array
    {
        return [
            'unit_amount' => 'integer',
        ];
    }

    public function connectedAccount(): BelongsTo
    {
        return $this->belongsTo(StripeConnectedAccount::class, 'stripe_connected_account_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}

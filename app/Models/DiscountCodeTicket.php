<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiscountCodeTicket extends Model
{
    /** @use HasFactory<\Database\Factories\DiscountCodeTicketFactory> */
    use HasFactory;

    protected $fillable = [
        'discount_code_id',
        'event_id',
        'ticket_id',
        'discount_type',
        'discount_value',
    ];

    protected function casts(): array
    {
        return [
            'discount_code_id' => 'integer',
            'event_id' => 'integer',
            'ticket_id' => 'integer',
            'discount_value' => 'decimal:2',
        ];
    }

    public function discountCode(): BelongsTo
    {
        return $this->belongsTo(DiscountCode::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }
}

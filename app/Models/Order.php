<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'session_id', 'status', 'payment_method', 'payment_status', 'last_payment_reminder_sent_at', 'stripe_checkout_session_id', 'stripe_payment_intent_id', 'total', 'contact_name', 'contact_email', 'booking_code', 'paid', 'checked_in', 'customer_id'];

    protected $casts = [
        'paid' => 'boolean',
        'checked_in' => 'boolean',
        'last_payment_reminder_sent_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}

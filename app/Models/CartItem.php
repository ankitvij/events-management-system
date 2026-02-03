<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = ['cart_id', 'event_id', 'ticket_id', 'quantity', 'price'];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }
}

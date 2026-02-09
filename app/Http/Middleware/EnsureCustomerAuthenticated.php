<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureCustomerAuthenticated
{
    public function handle(Request $request, Closure $next)
    {
        if (! session()->has('customer_id') && ! session()->has('customer_booking_order_id')) {
            return redirect()->route('customer.login');
        }

        return $next($request);
    }
}

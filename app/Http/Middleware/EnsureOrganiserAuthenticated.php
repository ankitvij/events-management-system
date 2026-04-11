<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganiserAuthenticated
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->session()->get('organiser_id')) {
            return redirect()->route('organisers.login')->with('error', 'Please sign in as organiser.');
        }

        return $next($request);
    }
}

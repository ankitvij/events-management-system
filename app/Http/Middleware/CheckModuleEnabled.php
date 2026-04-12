<?php

namespace App\Http\Middleware;

use App\Models\ModuleSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckModuleEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ?string $module = null): Response
    {
        if (! $module) {
            return $next($request);
        }

        if ((bool) $request->user()?->is_super_admin) {
            return $next($request);
        }

        if (! ModuleSetting::isEnabled($module)) {
            abort(404);
        }

        return $next($request);
    }
}

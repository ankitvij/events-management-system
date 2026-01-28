<?php

use App\Http\Controllers\EventController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    if (! auth()->check()) {
        // Build a public events query for the guest landing page
        $query = \App\Models\Event::with(['user', 'organisers'])->latest();

        // Guests should see only active events
        $query->where('active', true);

        // Optional active filter (allows showing inactive when explicitly requested)
        $filter = request('active');
        if ($filter === 'active') {
            $query->where('active', true);
        } elseif ($filter === 'inactive') {
            $query->where('active', false);
        }

        // Sort
        $sort = request('sort');
        switch ($sort) {
            case 'start_asc':
                $query->orderBy('start_at', 'asc');
                break;
            case 'start_desc':
                $query->orderBy('start_at', 'desc');
                break;
            case 'created_desc':
                $query->orderBy('created_at', 'desc');
                break;
            case 'title_asc':
                $query->orderBy('title', 'asc');
                break;
            case 'title_desc':
                $query->orderBy('title', 'desc');
                break;
            case 'country_asc':
                $query->orderBy('country', 'asc');
                break;
            case 'country_desc':
                $query->orderBy('country', 'desc');
                break;
            case 'city_asc':
                $query->orderBy('city', 'asc');
                break;
            case 'city_desc':
                $query->orderBy('city', 'desc');
                break;
            case 'active_asc':
                $query->orderBy('active', 'asc');
                break;
            case 'active_desc':
                $query->orderBy('active', 'desc');
                break;
            default:
                // keep default ordering (latest)
                break;
        }

        try {
            $cities = (clone $query)->whereNotNull('city')->where('city', '!=', '')->distinct()->orderBy('city')->pluck('city')->values()->all();
            $countries = (clone $query)->whereNotNull('country')->where('country', '!=', '')->distinct()->orderBy('country')->pluck('country')->values()->all();
        } catch (\Throwable $e) {
            $cities = [];
            $countries = [];
        }

        // Free-text search via `q`
        $search = request('q', '');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $like = "%{$search}%";
                $q->where('title', 'like', $like)
                    ->orWhere('description', 'like', $like)
                    ->orWhere('location', 'like', $like)
                    ->orWhere('city', 'like', $like)
                    ->orWhere('country', 'like', $like);
            });
        }

        // Apply optional city/country filters
        $city = request('city');
        if ($city) {
            $query->where('city', $city);
        }

        $country = request('country');
        if ($country) {
            $query->where('country', $country);
        }

        $page = request('page', 1);
        $params = request()->only(['q', 'city', 'country', 'sort', 'active']);
        $hash = md5(http_build_query($params));
        $cacheKey = "events.public.page.{$page}.params.{$hash}";
        $events = \Illuminate\Support\Facades\Cache::remember($cacheKey, now()->addMinutes(5), function () use ($query, $cacheKey) {
            $res = $query->paginate(10)->withQueryString();
            try {
                $keys = \Illuminate\Support\Facades\Cache::get('events.public.keys', []);
                if (! is_array($keys)) {
                    $keys = [];
                }
                if (! in_array($cacheKey, $keys, true)) {
                    $keys[] = $cacheKey;
                    \Illuminate\Support\Facades\Cache::put('events.public.keys', $keys, now()->addDays(1));
                }
            } catch (\Throwable $e) {
                // non-fatal
            }

            return $res;
        });

        if (app()->runningUnitTests()) {
            return response()->json(['events' => $events, 'cities' => $cities, 'countries' => $countries]);
        }

        return Inertia::render('Guest/Landing', [
            'events' => $events,
            'cities' => $cities,
            'countries' => $countries,
        ]);
    }

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    $events = [];

    if (auth()->check()) {
        $events = \App\Models\Event::where('user_id', auth()->id())
            ->where('start_at', '>=', now())
            ->orderBy('start_at')
            ->take(5)
            ->get();
    }

    return Inertia::render('dashboard', [
        'events' => $events,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

require __DIR__.'/settings.php';

// Events listing (public)
Route::get('events', [EventController::class, 'index'])->name('events.index');

// Allow public viewing of individual events at /events/{event}
Route::get('events/{event}', [EventController::class, 'show'])->name('events.show');

// Toggle active state (authenticated)
Route::put('events/{event}/active', [EventController::class, 'toggleActive'])->middleware(['auth']);

// Protect create/update/delete routes
Route::resource('events', EventController::class)->middleware(['auth'])->except(['index', 'show']);

use App\Http\Controllers\UserController;

Route::resource('users', UserController::class)->middleware(['auth']);

use App\Http\Controllers\RoleController;

Route::get('roles', [RoleController::class, 'index'])
    ->middleware(['auth', \App\Http\Middleware\CheckRole::class.':super_admin'])
    ->name('roles.index');

Route::put('roles/users/{user}', [RoleController::class, 'update'])
    ->middleware(['auth', \App\Http\Middleware\CheckRole::class.':super_admin'])
    ->name('roles.users.update');

Route::post('roles/users/{user}/undo', [RoleController::class, 'undo'])
    ->middleware(['auth', \App\Http\Middleware\CheckRole::class.':super_admin'])
    ->name('roles.users.undo');

// temporary POST fallback removed — updates should use PUT/PATCH via Inertia forms

use App\Http\Controllers\OrganiserController;

Route::resource('organisers', OrganiserController::class)->middleware(['auth']);

use App\Http\Controllers\CustomerController;

Route::resource('customers', CustomerController::class)->middleware(['auth']);

use App\Http\Controllers\PageController;

Route::resource('pages', PageController::class)->middleware(['auth', 'can:access-pages']);

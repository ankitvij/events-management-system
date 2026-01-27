<?php

use App\Http\Controllers\EventController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    if (! auth()->check()) {
        // Build a public events query for the guest landing page
        $query = \App\Models\Event::with(['user', 'organisers'])->latest();

        // Only show active events to guests
        $query->where('active', true);

        try {
            $cities = (clone $query)->whereNotNull('city')->where('city', '!=', '')->distinct()->orderBy('city')->pluck('city')->values()->all();
            $countries = (clone $query)->whereNotNull('country')->where('country', '!=', '')->distinct()->orderBy('country')->pluck('country')->values()->all();
        } catch (\Throwable $e) {
            $cities = [];
            $countries = [];
        }

        $events = $query->paginate(10)->withQueryString();

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

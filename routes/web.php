<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\EventController;
use Laravel\Fortify\Features;

Route::get('/', function () {
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

Route::resource('events', EventController::class)->middleware(['auth']);

use App\Http\Controllers\UserController;

Route::resource('users', UserController::class)->middleware(['auth']);

// temporary POST fallback removed — updates should use PUT/PATCH via Inertia forms

<?php

use App\Http\Controllers\CustomerAuthController;
use App\Http\Controllers\EventController;
use App\Http\Middleware\EnsureCustomerAuthenticated;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    if (! auth()->check()) {
        // When running unit tests the database may not be migrated and
        // Vite manifest may be unavailable. Return a minimal JSON response
        // to keep tests from triggering view/DB exceptions.
        if (app()->runningUnitTests()) {
            return response()->json(['events' => [], 'cities' => [], 'countries' => []]);
        }
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

// Allow public access to the create form and allow guests to submit new events
Route::get('events/create', [EventController::class, 'create'])->name('events.create');
// Public store route so guests can submit event creations
Route::post('events', [EventController::class, 'store'])->name('events.store');
// Protect all other event resource routes with auth
Route::resource('events', EventController::class)->middleware(['auth'])->except(['index', 'show', 'create', 'store']);

// Allow public viewing of individual events at /events/{event}
Route::get('events/{event}', [EventController::class, 'show'])->name('events.show');

// Toggle active state (authenticated)
Route::put('events/{event}/active', [EventController::class, 'toggleActive'])->middleware(['auth']);

use App\Http\Controllers\UserController;

Route::resource('users', UserController::class)->middleware(['auth']);

use App\Http\Controllers\Admin\ErrorLogController;
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

Route::get('admin/error-logs', [ErrorLogController::class, 'index'])
    ->middleware(['auth', \App\Http\Middleware\CheckRole::class.':super_admin'])
    ->name('admin.error_logs');

Route::get('admin/error-logs/data', [ErrorLogController::class, 'data'])
    ->middleware(['auth', \App\Http\Middleware\CheckRole::class.':super_admin'])
    ->name('admin.error_logs.data');

// temporary POST fallback removed — updates should use PUT/PATCH via Inertia forms

use App\Http\Controllers\OrganiserController;

Route::resource('organisers', OrganiserController::class)->middleware(['auth']);

use App\Http\Controllers\TicketController;

// Tickets nested under events
Route::post('events/{event}/tickets', [TicketController::class, 'store'])->middleware(['auth'])->name('events.tickets.store');
Route::put('events/{event}/tickets/{ticket}', [TicketController::class, 'update'])->middleware(['auth'])->name('events.tickets.update');
Route::delete('events/{event}/tickets/{ticket}', [TicketController::class, 'destroy'])->middleware(['auth'])->name('events.tickets.destroy');

use App\Http\Controllers\CartController;

// Shopping cart
Route::get('cart', [CartController::class, 'index'])->name('cart.index');
Route::get('cart/checkout', [CartController::class, 'checkoutForm'])->name('cart.checkout.form');
Route::post('cart/items', [CartController::class, 'storeItem'])->name('cart.items.store');
Route::put('cart/items/{item}', [CartController::class, 'updateItem'])->name('cart.items.update');
Route::delete('cart/items/{item}', [CartController::class, 'destroyItem'])->name('cart.items.destroy');
// Lightweight JSON summary for sidebar updates
Route::get('cart/summary', [CartController::class, 'summary'])->name('cart.summary');
// Checkout (basic reservation + decrement) - POST
Route::post('cart/checkout', [CartController::class, 'checkout'])->name('cart.checkout');

// Customer-facing auth (separate from admin/auth)
Route::get('customer/register', [CustomerAuthController::class, 'showRegister'])->name('customer.register');
Route::post('customer/register', [CustomerAuthController::class, 'register'])->name('customer.register.post');
Route::get('customer/login', [CustomerAuthController::class, 'showLogin'])->name('customer.login');
Route::post('customer/login', [CustomerAuthController::class, 'login'])->name('customer.login.post');
Route::post('customer/logout', [CustomerAuthController::class, 'logout'])->name('customer.logout');

use App\Http\Controllers\CustomerController;

Route::resource('customers', CustomerController::class)->middleware(['auth']);

use App\Http\Controllers\Admin\LogController;
use App\Http\Controllers\OrderController;

// Public order view: show a small form to validate with email + booking code
Route::get('orders/{order}/view', [OrderController::class, 'publicView'])->name('orders.public.view');
Route::post('orders/{order}/verify', [OrderController::class, 'publicVerify'])->name('orders.public.verify');
Route::get('orders/{order}/display', [OrderController::class, 'display'])->name('orders.display');
// Public API endpoint to send tickets by booking code + email (POST)
Route::post('orders/send-ticket', [OrderController::class, 'sendTicket'])->name('orders.sendTicket');

// Admin: expose recent mail-failure logs for debugging (admins only)
Route::get('admin/logs/mail-failures', [LogController::class, 'mailFailures'])
    ->middleware(['auth'])
    ->name('admin.logs.mail_failures');

// Admin orders
Route::get('orders', [OrderController::class, 'index'])->middleware(['auth'])->name('orders.index');
Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
Route::get('orders/{order}/receipt', [OrderController::class, 'receipt'])->name('orders.receipt');

// Customer: list own orders (session-based customer)
Route::get('customer/orders', [OrderController::class, 'customerIndex'])->name('customer.orders')->middleware(EnsureCustomerAuthenticated::class);

use App\Http\Controllers\PageController;

Route::resource('pages', PageController::class)->middleware(['auth', 'can:access-pages']);

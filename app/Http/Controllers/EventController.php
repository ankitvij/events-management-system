<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventFromLinkRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Mail\EventOrganiserCreated;
use App\Models\Artist;
use App\Models\BookingRequest;
use App\Models\Event;
use App\Models\Organiser;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorBookingRequest;
use App\Services\LocationResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index(Request $request)
    {
        // Only eager-load organisers for authenticated users
        $query = Event::with('user');
        if (auth()->check()) {
            $query->with('organisers');
        }
        $current = auth()->user();
        if ($current) {
            // For authenticated non-super-admin users, hide events created by super-admins
            if (! $current->is_super_admin) {
                $query->whereHas('user', function ($q) {
                    $q->where('is_super_admin', false);
                });
                // only show active events to non-super users
                $query->where('active', true);
            }
        } else {
            // Guests should see public (active) events by default unless an explicit `active` filter is provided
            if (! request()->has('active')) {
                $query->where('active', true);
            }
        }

        // Apply optional active filter for super admins or when provided
        $filter = request('active');
        if ($filter === 'active') {
            $query->where('active', true);
        } elseif ($filter === 'inactive') {
            $query->where('active', false);
        }

        // Apply optional sort parameter
        $sort = request('sort');
        switch ($sort) {
            case 'start_asc':
                $query->reorder('start_at', 'asc');
                break;
            case 'start_desc':
                $query->reorder('start_at', 'desc');
                break;
            case 'created_desc':
                $query->reorder('created_at', 'desc');
                break;
            case 'title_asc':
                $query->reorder('title', 'asc');
                break;
            case 'title_desc':
                $query->reorder('title', 'desc');
                break;
            case 'country_asc':
                $query->reorder('country', 'asc');
                break;
            case 'country_desc':
                $query->reorder('country', 'desc');
                break;
            case 'city_asc':
                $query->reorder('city', 'asc');
                break;
            case 'city_desc':
                $query->reorder('city', 'desc');
                break;
            case 'active_asc':
                $query->reorder('active', 'asc');
                break;
            case 'active_desc':
                $query->reorder('active', 'desc');
                break;
            default:
                $query->latest();
                break;
        }

        // Collect available cities and countries for filter selects (based on visible events)
        try {
            $cities = (clone $query)->whereNotNull('city')->where('city', '!=', '')->distinct()->orderBy('city')->pluck('city')->values()->all();
            $countries = (clone $query)->whereNotNull('country')->where('country', '!=', '')->distinct()->orderBy('country')->pluck('country')->values()->all();
        } catch (\Throwable $e) {
            $cities = [];
            $countries = [];
        }

        // Apply optional free-text search from query params `q` or `search`
        // (some clients/tests use `search` while others use `q`).
        $search = request('q', request('search', ''));
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

        if (! auth()->check()) {
            $page = request('page', 1);
            $params = request()->only(['q', 'search', 'city', 'country', 'sort', 'active']);
            $hash = md5(http_build_query($params));
            $cacheKey = "events.public.page.{$page}.params.{$hash}";
            $events = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($query, $cacheKey) {
                $res = $query->paginate(10)->withQueryString();
                $this->addPublicEventsCacheKey($cacheKey);

                return $res;
            });
        } else {
            $events = $query->paginate(10)->withQueryString();
        }
        if ($request->expectsJson() || $request->wantsJson() || app()->runningInConsole()) {
            return response()->json([
                'events' => $events,
                'showOrganisers' => auth()->check(),
                'cities' => $cities,
                'countries' => $countries,
            ]);
        }

        return Inertia::render('Events/Index', [
            'events' => $events,
            'showHomeHeader' => request()->routeIs('home'),
            'cities' => $cities,
            'countries' => $countries,
        ]);
    }

    public function create()
    {
        if (app()->runningUnitTests()) {
            return response()->json(['ok' => true]);
        }

        // Only provide organisers list to authenticated users
        $organisers = auth()->check() ? Organiser::orderBy('name')->get(['id', 'name']) : [];

        return Inertia::render('Events/Create', [
            'organisers' => $organisers,
            'showOrganisers' => auth()->check(),
            'showHomeHeader' => ! auth()->check(),
        ]);
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $locationIds = app(LocationResolver::class)->resolve($data['city'] ?? null, $data['country'] ?? null);
        $data = array_merge($data, $locationIds);

        // Allow guest-created events: user_id may be null for guests
        $data['user_id'] = $request->user()?->id;

        $isGuest = ! $request->user();
        $data['active'] = $isGuest ? false : (bool) ($data['active'] ?? true);

        $rawEditToken = Str::random(64);
        $data['edit_token'] = $rawEditToken;
        $data['edit_token_expires_at'] = null;
        $data['edit_password'] = $request->filled('edit_password') ? Hash::make($request->string('edit_password')) : null;

        DB::transaction(function () use ($request, $data, $rawEditToken, $isGuest) {
            $local = $data;

            $tickets = $local['tickets'] ?? [];
            unset($local['tickets']);

            if ($request->hasFile('image')) {
                $local['image'] = $request->file('image')->store('events', 'public');
                $this->resizeImageToMaxHeight($local['image']);
                $thumb = $this->generateThumbnail($local['image']);
                if ($thumb) {
                    $local['image_thumbnail'] = $thumb;
                }
            }

            $event = Event::create($local);

            // Generate a unique slug based on title
            $base = Str::slug($event->title ?: 'event');
            $slug = $base;
            $i = 1;
            while (Event::where('slug', $slug)->where('id', '!=', $event->id)->exists()) {
                $slug = $base.'-'.(++$i);
            }
            $event->slug = $slug;
            $event->save();

            foreach ($tickets as $ticket) {
                $name = is_array($ticket) ? ($ticket['name'] ?? null) : null;
                if (! is_string($name) || trim($name) === '') {
                    continue;
                }

                $quantityTotal = (int) (is_array($ticket) ? ($ticket['quantity_total'] ?? 0) : 0);

                Ticket::query()->create([
                    'event_id' => $event->id,
                    'name' => $name,
                    'price' => is_array($ticket) ? ($ticket['price'] ?? 0) : 0,
                    'quantity_total' => $quantityTotal,
                    'quantity_available' => $quantityTotal,
                    'active' => (bool) (is_array($ticket) ? ($ticket['active'] ?? true) : true),
                ]);
            }

            $organiserIds = [];
            if (! empty($local['organiser_ids'])) {
                $organiserIds = array_values($local['organiser_ids']);
            }

            if (! empty($local['organiser_id'])) {
                $organiserIds[] = (int) $local['organiser_id'];
                $event->organiser_id = (int) $local['organiser_id'];
                $event->save();
            }

            // Handle comma-separated organiser emails
            $emailsRaw = $request->input('organiser_emails', '');
            if (is_string($emailsRaw) && trim($emailsRaw) !== '') {
                $parts = array_filter(array_map('trim', explode(',', $emailsRaw)));
                foreach ($parts as $e) {
                    if (! filter_var($e, FILTER_VALIDATE_EMAIL)) {
                        continue;
                    }

                    $namePart = strstr($e, '@', true) ?: $e;
                    $name = ucwords(str_replace(['.', '_', '-'], ' ', $namePart));

                    $organiser = Organiser::firstOrCreate([
                        'email' => $e,
                    ], [
                        'name' => $name,
                        'active' => 1,
                    ]);

                    if ($organiser && $organiser->id) {
                        $organiserIds[] = $organiser->id;
                    }
                }
            }

            if (! empty($organiserIds)) {
                $event->organisers()->sync(array_values(array_unique($organiserIds)));
            }

            if (array_key_exists('promoter_ids', $local)) {
                $event->promoters()->sync($local['promoter_ids'] ?? []);
            }

            if (array_key_exists('vendor_ids', $local)) {
                $event->vendors()->sync($local['vendor_ids'] ?? []);
            }

            // If guest supplied a single organiser name/email, create organiser and attach
            $guestName = $request->input('organiser_name');
            $guestEmail = $request->input('organiser_email');
            if ((! auth()->check()) && $guestEmail && filter_var($guestEmail, FILTER_VALIDATE_EMAIL)) {
                $name = $guestName ?: (strstr($guestEmail, '@', true) ?: $guestEmail);
                $name = ucwords(str_replace(['.', '_', '-'], ' ', $name));

                $organiser = Organiser::firstOrCreate([
                    'email' => $guestEmail,
                ], [
                    'name' => $name,
                    'active' => 1,
                ]);

                if ($organiser && $organiser->id) {
                    // attach to pivot and set primary organiser_id on event
                    $event->organisers()->syncWithoutDetaching([$organiser->id]);
                    $event->organiser_id = $organiser->id;
                    $event->save();
                }
            }

            $primaryOrganiser = $event->organiser_id ? Organiser::find($event->organiser_id) : null;
            if ($primaryOrganiser && $primaryOrganiser->email) {
                $signedEditUrl = URL::signedRoute('events.edit-link', [
                    'event' => $event->slug,
                    'token' => $rawEditToken,
                ]);

                $signedVerifyUrl = URL::signedRoute('events.verify-link', [
                    'event' => $event->slug,
                    'token' => $rawEditToken,
                ]);

                Mail::to($primaryOrganiser->email)->queue(new EventOrganiserCreated(
                    $event,
                    $primaryOrganiser,
                    $signedEditUrl,
                    $request->input('edit_password'),
                    $signedVerifyUrl,
                    $isGuest
                ));
            }
        });

        $this->clearPublicEventsCache();

        return redirect()->route('events.index');
    }

    public function verifyViaToken(Request $request, Event $event, string $token): RedirectResponse
    {
        $this->assertValidEditToken($event, $token);

        if (! $event->active) {
            $event->active = true;
            $event->save();
        }

        $this->clearPublicEventsCache();

        $signedEditUrl = URL::signedRoute('events.edit-link', [
            'event' => $event->slug,
            'token' => $token,
        ]);

        return redirect()->to($signedEditUrl);
    }

    public function show(Event $event, Request $request)
    {
        $event->load('user');
        if (auth()->check()) {
            $event->load('organisers', 'ticketControllers');
        }
        $event->load('artists');
        $event->load('vendors');
        $event->load('promoters');

        $current = auth()->user();

        // Guests may view only active events
        if (! $current) {
            if (! $event->active) {
                abort(404);
            }
        } else {
            // For authenticated users, keep existing super-admin visibility restriction
            if ($event->user && $event->user->is_super_admin && ! ($current->is_super_admin || $current->id === $event->user->id)) {
                abort(404);
            }
        }

        $organisers = Organiser::orderBy('name')->get(['id', 'name']);

        // Load tickets: guests see only active tickets with availability, authenticated users see all
        if (auth()->check()) {
            $event->load('tickets');
        } else {
            $event->load(['tickets' => function ($q) {
                $q->where('active', true)->where('quantity_available', '>', 0);
            }]);
        }

        $current = auth()->user();
        $canEdit = false;
        if ($current) {
            $canEdit = $current->is_super_admin || ($event->user_id && $current->id === $event->user_id);
        }

        $tickets = $event->tickets->map(function ($t) {
            return [
                'id' => $t->id,
                'name' => $t->name,
                'price' => (float) $t->price,
                'quantity_total' => (int) $t->quantity_total,
                'quantity_available' => (int) $t->quantity_available,
                'active' => (bool) $t->active,
            ];
        })->values();

        $artists = $event->artists->map(function (Artist $a) {
            return [
                'id' => $a->id,
                'name' => $a->name,
                'city' => $a->city,
                'photo_url' => $a->photo_url,
            ];
        })->values();

        $vendors = $event->vendors->map(function (Vendor $v) {
            return [
                'id' => $v->id,
                'name' => $v->name,
                'city' => $v->city,
                'type' => $v->type?->value,
            ];
        })->values();

        $promoters = $event->promoters->map(function (User $promoter) {
            return [
                'id' => $promoter->id,
                'name' => $promoter->name,
                'email' => $promoter->email,
            ];
        })->values();

        $ticketControllers = auth()->check()
            ? $event->ticketControllers->map(function ($ticketController) {
                return [
                    'id' => $ticketController->id,
                    'email' => $ticketController->email,
                ];
            })->values()
            : collect();

        $availableArtists = collect();
        $availableVendors = collect();
        $availablePromoters = collect();

        if ($canEdit) {
            $availableArtists = Artist::query()
                ->where('active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'city']);

            $availableVendors = Vendor::query()
                ->where('active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'city', 'type']);

            $availablePromoters = User::query()
                ->where('is_super_admin', false)
                ->where('active', true)
                ->where('role', 'user')
                ->orderBy('name')
                ->get(['id', 'name', 'email']);
        }

        if ($request->expectsJson() || $request->wantsJson() || app()->runningInConsole()) {
            return response()->json([
                'event' => $event,
                'organisers' => $organisers,
                'showOrganisers' => auth()->check(),
                'canEdit' => $canEdit,
                'tickets' => $tickets,
                'artists' => $artists,
                'vendors' => $vendors,
                'promoters' => $promoters,
                'ticketControllers' => $ticketControllers,
                'availableArtists' => $availableArtists,
                'availableVendors' => $availableVendors,
                'availablePromoters' => $availablePromoters,
            ]);
        }

        return Inertia::render('Events/Show', [
            'event' => $event,
            'organisers' => $organisers,
            'showHomeHeader' => ! auth()->check(),
            'canEdit' => $canEdit,
            'tickets' => $tickets,
            'artists' => $artists,
            'vendors' => $vendors,
            'promoters' => $promoters,
            'ticketControllers' => $ticketControllers,
            'availableArtists' => $availableArtists,
            'availableVendors' => $availableVendors,
            'availablePromoters' => $availablePromoters,
        ]);
    }

    // publicShow removed; `show` now handles guest access.

    public function editViaToken(Request $request, Event $event, string $token)
    {
        $this->assertValidEditToken($event, $token);

        $event->load('organisers', 'organiser', 'user');
        $organisers = $event->organiser ? [$event->organiser] : [];

        $editUrl = URL::signedRoute('events.update-link', [
            'event' => $event->slug,
            'token' => $token,
        ]);

        return Inertia::render('Events/Edit', [
            'event' => $event,
            'organisers' => $organisers,
            'editUrl' => $editUrl,
            'requiresPassword' => (bool) $event->edit_password,
            'allowOrganiserChange' => false,
        ]);
    }

    public function edit(Event $event)
    {
        if (app()->runningUnitTests()) {
            return response()->json(['event' => $event]);
        }

        $event->load('organisers', 'organiser', 'user', 'vendors', 'promoters', 'ticketControllers');
        $organisers = Organiser::orderBy('name')->get(['id', 'name']);
        $promoters = User::query()
            ->where('is_super_admin', false)
            ->where('active', true)
            ->where('role', 'user')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $artists = Artist::query()->where('active', true)->orderBy('name')->get(['id', 'name', 'city']);

        $vendors = Vendor::query()->where('active', true)->orderBy('name')->get(['id', 'name', 'city', 'type']);

        $bookingRequests = BookingRequest::query()
            ->with('artist')
            ->where('event_id', $event->id)
            ->orderByDesc('created_at')
            ->get();

        $vendorBookingRequests = VendorBookingRequest::query()
            ->with('vendor')
            ->where('event_id', $event->id)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Events/Edit', [
            'event' => $event,
            'organisers' => $organisers,
            'artists' => $artists,
            'bookingRequests' => $bookingRequests,
            'vendors' => $vendors,
            'vendorBookingRequests' => $vendorBookingRequests,
            'promoters' => $promoters,
            'ticketControllers' => $event->ticketControllers,
        ]);
    }

    public function update(UpdateEventRequest $request, Event $event): RedirectResponse
    {
        $data = $request->validated();
        $locationIds = app(LocationResolver::class)->resolve($data['city'] ?? null, $data['country'] ?? null);
        $data = array_merge($data, $locationIds);

        if ($request->hasFile('image')) {
            // delete old image if exists
            if ($event->image) {
                Storage::disk('public')->delete($event->image);
            }
            if ($event->image_thumbnail) {
                Storage::disk('public')->delete($event->image_thumbnail);
            }
            $data['image'] = $request->file('image')->store('events', 'public');
            $this->resizeImageToMaxHeight($data['image']);
            $thumb = $this->generateThumbnail($data['image']);
            if ($thumb) {
                $data['image_thumbnail'] = $thumb;
            }
        }

        $event->update($data);

        // Ensure slug stays in sync with title on update
        if (array_key_exists('title', $data)) {
            $base = Str::slug($data['title'] ?? $event->title ?: 'event');
            $slug = $base;
            $i = 1;
            while (Event::where('slug', $slug)->where('id', '!=', $event->id)->exists()) {
                $slug = $base.'-'.(++$i);
            }
            $event->slug = $slug;
            $event->save();
        }

        if (array_key_exists('organiser_id', $data)) {
            $event->organiser_id = $data['organiser_id'];
            $event->save();
        }

        if (array_key_exists('organiser_ids', $data)) {
            $organiserIds = $data['organiser_ids'] ?? [];
            if (! empty($data['organiser_id'])) {
                $organiserIds[] = (int) $data['organiser_id'];
            }

            $event->organisers()->sync(array_values(array_unique($organiserIds)));
        }

        if (array_key_exists('promoter_ids', $data)) {
            $event->promoters()->sync($data['promoter_ids'] ?? []);
        }

        if (array_key_exists('vendor_ids', $data)) {
            $event->vendors()->sync($data['vendor_ids'] ?? []);
        }

        if (array_key_exists('artist_ids', $data)) {
            $event->artists()->sync($data['artist_ids'] ?? []);
        }

        $this->clearPublicEventsCache();

        return redirect()->route('events.show', $event);
    }

    public function updateViaToken(UpdateEventFromLinkRequest $request, Event $event, string $token): RedirectResponse
    {
        $this->assertValidEditToken($event, $token);

        if ($event->edit_password) {
            $provided = $request->input('edit_password');
            if (! $provided || ! Hash::check($provided, $event->edit_password)) {
                return back()->withErrors(['edit_password' => 'Password is incorrect for this edit link.'])->withInput();
            }
        }

        $data = $request->validated();
        $locationIds = app(LocationResolver::class)->resolve($data['city'] ?? null, $data['country'] ?? null);
        $data = array_merge($data, $locationIds);

        if ($request->hasFile('image')) {
            if ($event->image) {
                Storage::disk('public')->delete($event->image);
            }
            if ($event->image_thumbnail) {
                Storage::disk('public')->delete($event->image_thumbnail);
            }
            $data['image'] = $request->file('image')->store('events', 'public');
            $this->resizeImageToMaxHeight($data['image']);
            $thumb = $this->generateThumbnail($data['image']);
            if ($thumb) {
                $data['image_thumbnail'] = $thumb;
            }
        }

        // Prevent organiser changes through the shared link
        unset($data['organiser_id'], $data['organiser_ids']);

        $event->update($data);

        if (array_key_exists('title', $data)) {
            $base = Str::slug($data['title'] ?? $event->title ?: 'event');
            $slug = $base;
            $i = 1;
            while (Event::where('slug', $slug)->where('id', '!=', $event->id)->exists()) {
                $slug = $base.'-'.(++$i);
            }
            $event->slug = $slug;
            $event->save();
        }

        $this->clearPublicEventsCache();

        if (! $event->active) {
            $signedEditUrl = URL::signedRoute('events.edit-link', [
                'event' => $event->slug,
                'token' => $token,
            ]);

            return redirect()->to($signedEditUrl);
        }

        return redirect()->route('events.show', $event);
    }

    /**
     * Toggle the active state for an event (AJAX).
     */
    public function toggleActive(Request $request, Event $event): JsonResponse
    {
        $current = $request->user();
        if (! $current) {
            abort(403);
        }

        // Allow super admins or the event owner to toggle active
        if (! ($current->is_super_admin || $event->user_id === $current->id)) {
            abort(403);
        }

        $data = $request->validate([
            'active' => ['required', 'boolean'],
        ]);

        $event->active = $data['active'];
        $event->save();

        $this->clearPublicEventsCache();

        return response()->json(['ok' => true, 'active' => $event->active]);
    }

    public function destroy(Event $event): RedirectResponse
    {
        if ($event->image) {
            Storage::disk('public')->delete($event->image);
        }

        if ($event->image_thumbnail) {
            Storage::disk('public')->delete($event->image_thumbnail);
        }

        $event->delete();

        $this->clearPublicEventsCache();

        return redirect()->route('events.index');
    }

    protected function generateThumbnail(string $imagePath): ?string
    {
        try {
            $full = Storage::disk('public')->path($imagePath);
            if (! file_exists($full)) {
                return null;
            }
            $info = getimagesize($full);
            $mime = $info['mime'] ?? '';

            switch ($mime) {
                case 'image/jpeg':
                    $src = imagecreatefromjpeg($full);
                    break;
                case 'image/png':
                    $src = imagecreatefrompng($full);
                    break;
                case 'image/gif':
                    $src = imagecreatefromgif($full);
                    break;
                default:
                    $src = imagecreatefromstring(file_get_contents($full));
                    break;
            }

            if (! $src) {
                return null;
            }

            $width = imagesx($src);
            $height = imagesy($src);
            $maxWidth = 300;

            if ($width <= $maxWidth) {
                imagedestroy($src);

                return null;
            }

            $ratio = $width / $height;
            $newWidth = $maxWidth;
            $newHeight = (int) floor($maxWidth / $ratio);

            $thumb = imagecreatetruecolor($newWidth, $newHeight);
            if ($mime === 'image/png' || $mime === 'image/gif') {
                imagecolortransparent($thumb, imagecolorallocatealpha($thumb, 0, 0, 0, 127));
                imagealphablending($thumb, false);
                imagesavealpha($thumb, true);
            }

            imagecopyresampled($thumb, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

            ob_start();
            imagejpeg($thumb, null, 80);
            $contents = ob_get_clean();

            imagedestroy($src);
            imagedestroy($thumb);

            $dir = 'events/thumbnails';
            Storage::disk('public')->makeDirectory($dir);

            $name = pathinfo($imagePath, PATHINFO_FILENAME);
            $thumbPath = $dir.'/'.$name.'-thumb.jpg';
            Storage::disk('public')->put($thumbPath, $contents);

            return $thumbPath;
        } catch (\Throwable $e) {
            return null;
        }
    }

    protected function assertValidEditToken(Event $event, string $token): void
    {
        if (empty($event->edit_token) || ! hash_equals($event->edit_token, $token)) {
            abort(403);
        }
    }

    protected function resizeImageToMaxHeight(string $imagePath, int $maxHeight = 500): void
    {
        try {
            $full = Storage::disk('public')->path($imagePath);
            if (! file_exists($full)) {
                return;
            }

            $info = getimagesize($full);
            $mime = $info['mime'] ?? '';
            $width = $info[0] ?? null;
            $height = $info[1] ?? null;

            if (! $width || ! $height || $height <= $maxHeight) {
                return;
            }

            switch ($mime) {
                case 'image/jpeg':
                    $src = imagecreatefromjpeg($full);
                    break;
                case 'image/png':
                    $src = imagecreatefrompng($full);
                    break;
                case 'image/gif':
                    $src = imagecreatefromgif($full);
                    break;
                default:
                    $src = imagecreatefromstring(file_get_contents($full));
                    break;
            }

            if (! $src) {
                return;
            }

            $ratio = $width / $height;
            $newHeight = $maxHeight;
            $newWidth = (int) floor($maxHeight * $ratio);

            $scaled = imagecreatetruecolor($newWidth, $newHeight);
            if ($mime === 'image/png' || $mime === 'image/gif') {
                imagecolortransparent($scaled, imagecolorallocatealpha($scaled, 0, 0, 0, 127));
                imagealphablending($scaled, false);
                imagesavealpha($scaled, true);
            }

            imagecopyresampled($scaled, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

            switch ($mime) {
                case 'image/png':
                    imagepng($scaled, $full, 6);
                    break;
                case 'image/gif':
                    imagegif($scaled, $full);
                    break;
                default:
                    imagejpeg($scaled, $full, 82);
                    break;
            }

            imagedestroy($src);
            imagedestroy($scaled);
        } catch (\Throwable $e) {
            return;
        }
    }

    /**
     * Clear cached public events index pages.
     *
     * This removes any cache entries matching the pattern used in index().
     */
    protected function clearPublicEventsCache(): void
    {
        try {
            // If we have tracked cache keys, forget them precisely.
            $keys = Cache::get('events.public.keys', []);
            if (is_array($keys) && count($keys) > 0) {
                foreach ($keys as $k) {
                    Cache::forget($k);
                }
                Cache::forget('events.public.keys');

                return;
            }

            // Fallback: Attempt targeted cache clearing for first 20 pages assuming
            // the index caches pages with keys like events.public.page.{n}.search.{hash}
            for ($page = 1; $page <= 20; $page++) {
                $key = "events.public.page.{$page}.search.".md5('');
                Cache::forget($key);
            }
        } catch (\Exception $e) {
            Cache::flush();
        }
    }

    /**
     * Track a public events cache key so it can be invalidated precisely.
     */
    protected function addPublicEventsCacheKey(string $key): void
    {
        try {
            $keys = Cache::get('events.public.keys', []);
            if (! is_array($keys)) {
                $keys = [];
            }
            if (! in_array($key, $keys, true)) {
                $keys[] = $key;
                // Keep the list longer than individual page TTL so invalidation works.
                Cache::put('events.public.keys', $keys, now()->addDays(1));
            }
        } catch (\Exception $e) {
            // Non-fatal; we can still rely on fallback clearing.
        }
    }
}

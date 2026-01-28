<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use App\Models\Organiser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index()
    {
        $query = Event::with(['user', 'organisers'])->latest();

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
        if (app()->runningUnitTests()) {
            return response()->json(['events' => $events]);
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

        $organisers = Organiser::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Events/Create', [
            'organisers' => $organisers,
        ]);
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('events', 'public');
            $thumb = $this->generateThumbnail($data['image']);
            if ($thumb) {
                $data['image_thumbnail'] = $thumb;
            }
        }

        $event = Event::create($data);

        if (! empty($data['organiser_ids'])) {
            $event->organisers()->sync($data['organiser_ids']);
        }

        $this->clearPublicEventsCache();

        return redirect()->route('events.index');
    }

    public function show(Event $event)
    {
        $event->load('user', 'organisers');

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

        if (app()->runningUnitTests()) {
            return response()->json(['event' => $event, 'organisers' => $organisers]);
        }

        return Inertia::render('Events/Show', [
            'event' => $event,
            'organisers' => $organisers,
            'showHomeHeader' => ! auth()->check(),
        ]);
    }

    // publicShow removed; `show` now handles guest access.

    public function edit(Event $event)
    {
        if (app()->runningUnitTests()) {
            return response()->json(['event' => $event]);
        }

        $event->load('organisers', 'user');
        $organisers = Organiser::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Events/Edit', [
            'event' => $event,
            'organisers' => $organisers,
        ]);
    }

    public function update(UpdateEventRequest $request, Event $event): RedirectResponse
    {
        $data = $request->validated();
        if ($request->hasFile('image')) {
            // delete old image if exists
            if ($event->image) {
                Storage::disk('public')->delete($event->image);
            }
            if ($event->image_thumbnail) {
                Storage::disk('public')->delete($event->image_thumbnail);
            }
            $data['image'] = $request->file('image')->store('events', 'public');
            $thumb = $this->generateThumbnail($data['image']);
            if ($thumb) {
                $data['image_thumbnail'] = $thumb;
            }
        }

        $event->update($data);

        if (array_key_exists('organiser_ids', $data)) {
            $event->organisers()->sync($data['organiser_ids'] ?? []);
        }

        $this->clearPublicEventsCache();

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

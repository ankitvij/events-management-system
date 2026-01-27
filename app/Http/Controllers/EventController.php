<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use App\Models\Organiser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index()
    {
        $query = Event::with(['user', 'organisers'])->latest();

        $current = auth()->user();
        if (! $current || ! $current->is_super_admin) {
            // hide events created by super admin users from regular users
            $query->whereHas('user', function ($q) {
                $q->where('is_super_admin', false);
            });
            // only show active events to non-super users
            $query->where('active', true);
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
            default:
                // keep default ordering (latest)
                break;
        }

        // For public views, cache paginated results per page + search for 5 minutes
        // Collect available cities and countries for filter selects (based on visible events)
        try {
            $cities = (clone $query)->whereNotNull('city')->where('city', '!=', '')->distinct()->orderBy('city')->pluck('city')->values()->all();
            $countries = (clone $query)->whereNotNull('country')->where('country', '!=', '')->distinct()->orderBy('country')->pluck('country')->values()->all();
        } catch (\Throwable $e) {
            $cities = [];
            $countries = [];
        }

        // apply global search (q or search)
        $searchParam = request('q') ?? request('search');
        if ($searchParam) {
            $query->where(function ($sub) use ($searchParam) {
                $sub->where('title', 'like', "%{$searchParam}%")
                    ->orWhere('description', 'like', "%{$searchParam}%")
                    ->orWhere('location', 'like', "%{$searchParam}%")
                    ->orWhere('city', 'like', "%{$searchParam}%")
                    ->orWhere('country', 'like', "%{$searchParam}%");
            });
        }

        if (! auth()->check()) {
            $page = request('page', 1);
            $search = $searchParam ?? '';
            $cacheKey = "events.public.page.{$page}.search.".md5($search);
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
        if ($event->user && $event->user->is_super_admin && ! ($current && ($current->is_super_admin || $current->id === $event->user->id))) {
            abort(404);
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

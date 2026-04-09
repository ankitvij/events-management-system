<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVenueRequest;
use App\Http\Requests\UpdateVenueRequest;
use App\Models\Venue;
use App\Services\LocationResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class VenueController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth')->except(['index', 'show']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse|Response
    {
        $this->authorize('viewAny', Venue::class);

        $query = Venue::query()->orderBy('name');
        $current = $request->user();

        if ($current && $current->hasRole('agency') && ! $current->hasRole(['admin', 'super_admin'])) {
            $query->where('agency_id', $current->agency_id);
        }

        if (! Auth::check()) {
            $query->where('active', true);
        }

        $search = $request->string('q')->toString();
        if ($search !== '') {
            $like = "%{$search}%";
            $query->where(function ($builder) use ($like): void {
                $builder->where('name', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('city', 'like', $like);
            });
        }

        $venues = $query->paginate(20)->withQueryString();

        if ($request->expectsJson() || app()->runningUnitTests()) {
            return response()->json(['venues' => $venues]);
        }

        return Inertia::render('Venues/Index', ['venues' => $venues]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', Venue::class);

        return Inertia::render('Venues/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreVenueRequest $request): RedirectResponse
    {
        $this->authorize('create', Venue::class);

        $data = $request->validated();
        $locationIds = app(LocationResolver::class)->resolve($data['city'] ?? null, null);
        $data = array_merge($data, $locationIds);
        $data['active'] = (bool) ($data['active'] ?? false);

        $current = $request->user();
        if ($current && $current->hasRole('agency') && ! $current->hasRole(['admin', 'super_admin'])) {
            $data['agency_id'] = $current->agency_id;
        }

        $venue = Venue::query()->create($data);

        return redirect()->route('venues.show', $venue)->with('success', 'Venue created.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Venue $venue): Response
    {
        $this->authorize('view', $venue);

        /** @var \App\Models\User|null $current */
        $current = Auth::user();
        if ($current && $current->hasRole('agency') && ! $current->hasRole(['admin', 'super_admin']) && (int) ($venue->agency_id ?? 0) !== (int) ($current->agency_id ?? 0)) {
            abort(404);
        }

        if (! Auth::check() && ! $venue->active) {
            abort(404);
        }

        return Inertia::render('Venues/Show', ['venue' => $venue]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Venue $venue): Response
    {
        $this->authorize('update', $venue);

        return Inertia::render('Venues/Edit', ['venue' => $venue]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateVenueRequest $request, Venue $venue): RedirectResponse
    {
        $this->authorize('update', $venue);

        $data = $request->validated();
        $locationIds = app(LocationResolver::class)->resolve($data['city'] ?? null, null);
        $data = array_merge($data, $locationIds);
        $data['active'] = (bool) ($data['active'] ?? false);

        $venue->update($data);

        return redirect()->route('venues.show', $venue)->with('success', 'Venue updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Venue $venue): RedirectResponse
    {
        $this->authorize('delete', $venue);

        $venue->delete();

        return redirect()->route('venues.index')->with('success', 'Venue deleted.');
    }

    public function toggleActive(Request $request, Venue $venue): RedirectResponse
    {
        $this->authorize('update', $venue);

        $data = $request->validate([
            'active' => ['required', 'boolean'],
        ]);

        $venue->update(['active' => (bool) $data['active']]);

        return redirect()->back()->with('success', 'Venue status updated.');
    }
}

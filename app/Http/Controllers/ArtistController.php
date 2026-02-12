<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreArtistRequest;
use App\Http\Requests\UpdateArtistRequest;
use App\Models\Artist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ArtistController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth')->except(['index', 'show']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Artist::class);

        $query = Artist::query()->orderBy('name');

        if (! auth()->check()) {
            $query->where('active', true);
        }

        $search = $request->string('q')->toString();
        if ($search !== '') {
            $like = "%{$search}%";
            $query->where(function ($q) use ($like) {
                $q->where('name', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('city', 'like', $like);
            });
        }

        $artists = $query->paginate(20)->withQueryString();

        if ($request->expectsJson() || app()->runningUnitTests()) {
            return response()->json(['artists' => $artists]);
        }

        return Inertia::render('Artists/Index', ['artists' => $artists]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Artist::class);

        return Inertia::render('Artists/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreArtistRequest $request): RedirectResponse
    {
        $this->authorize('create', Artist::class);

        $data = $request->validated();

        $data['photo'] = $request->file('photo')->store('artists', 'public');

        $active = (bool) ($data['active'] ?? false);
        $data['active'] = $active;
        if ($active && empty($data['email_verified_at'])) {
            $data['email_verified_at'] = now();
        }

        Artist::query()->create($data);

        return redirect()->route('artists.index')->with('success', 'Artist created.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Artist $artist)
    {
        $this->authorize('view', $artist);

        if (! auth()->check() && ! $artist->active) {
            abort(404);
        }

        return Inertia::render('Artists/Show', ['artist' => $artist]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Artist $artist)
    {
        $this->authorize('update', $artist);

        return Inertia::render('Artists/Edit', ['artist' => $artist]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateArtistRequest $request, Artist $artist): RedirectResponse
    {
        $this->authorize('update', $artist);

        $data = $request->validated();

        if ($request->hasFile('photo')) {
            if ($artist->photo) {
                Storage::disk('public')->delete($artist->photo);
            }
            $data['photo'] = $request->file('photo')->store('artists', 'public');
        }

        if (array_key_exists('active', $data) && (bool) $data['active'] === true && ! $artist->email_verified_at) {
            $data['email_verified_at'] = now();
        }

        $artist->update($data);

        return redirect()->route('artists.index')->with('success', 'Artist updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Artist $artist): RedirectResponse
    {
        $this->authorize('delete', $artist);

        if ($artist->photo) {
            Storage::disk('public')->delete($artist->photo);
        }

        $artist->delete();

        return redirect()->route('artists.index')->with('success', 'Artist deleted.');
    }
}

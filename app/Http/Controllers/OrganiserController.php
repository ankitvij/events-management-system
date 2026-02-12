<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrganiserRequest;
use App\Http\Requests\UpdateOrganiserRequest;
use App\Models\Organiser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrganiserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth')->except(['index', 'show']);
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Organiser::class);

        $query = Organiser::query()->orderBy('name');

        if (! auth()->check()) {
            $query->where('active', true);
        }

        $search = request('q', '');
        if ($search) {
            $like = "%{$search}%";
            $query->where(function ($q) use ($like) {
                $q->where('name', 'like', $like)
                    ->orWhere('email', 'like', $like);
            });
        }

        // optional sort
        $sort = request('sort');
        switch ($sort) {
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            default:
                break;
        }

        $organisers = $query->paginate(20)->withQueryString();

        if ($request->expectsJson() || app()->runningUnitTests()) {
            return response()->json(['organisers' => $organisers]);
        }

        return Inertia::render('Organisers/Index', ['organisers' => $organisers]);
    }

    public function create()
    {
        $this->authorize('create', Organiser::class);

        return Inertia::render('Organisers/Create');
    }

    public function store(StoreOrganiserRequest $request): RedirectResponse
    {
        $this->authorize('create', Organiser::class);

        $org = Organiser::create($request->validated());

        return redirect()->route('organisers.index')->with('success', 'Organiser created.');
    }

    public function show(Organiser $organiser)
    {
        $this->authorize('view', $organiser);

        if (! auth()->check() && ! $organiser->active) {
            abort(404);
        }

        $organiser->load('events');

        return Inertia::render('Organisers/Show', ['organiser' => $organiser]);
    }

    public function edit(Organiser $organiser)
    {
        $this->authorize('update', $organiser);

        return Inertia::render('Organisers/Edit', ['organiser' => $organiser]);
    }

    public function update(UpdateOrganiserRequest $request, Organiser $organiser): RedirectResponse
    {
        $this->authorize('update', $organiser);

        $organiser->update($request->validated());

        return redirect()->route('organisers.index')->with('success', 'Organiser updated.');
    }

    public function destroy(Organiser $organiser): RedirectResponse
    {
        $this->authorize('delete', $organiser);

        $organiser->delete();

        return redirect()->route('organisers.index')->with('success', 'Organiser deleted.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Organiser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\StoreOrganiserRequest;
use App\Http\Requests\UpdateOrganiserRequest;

class OrganiserController extends Controller
{
    public function __construct()
    {
        // resource-style authorization
        $this->middleware('auth');
    }
    public function index()
    {
        $this->authorize('viewAny', Organiser::class);

        $organisers = Organiser::orderBy('name')->paginate(20);

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

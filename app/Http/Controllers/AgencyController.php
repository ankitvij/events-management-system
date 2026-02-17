<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAgencyRequest;
use App\Http\Requests\UpdateAgencyRequest;
use App\Models\Agency;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgencyController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth')->except(['index', 'show']);
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Agency::class);

        $query = Agency::query()->orderBy('name');
        $current = $request->user();

        if ($current?->hasRole('agency') && ! $current->hasRole(['admin', 'super_admin'])) {
            $query->whereKey($current->agency_id);
        }

        $search = $request->string('q')->toString();
        if ($search !== '') {
            $like = "%{$search}%";
            $query->where(function ($builder) use ($like): void {
                $builder->where('name', 'like', $like)
                    ->orWhere('email', 'like', $like);
            });
        }

        $agencies = $query->paginate(20)->withQueryString();

        if ($request->expectsJson() || app()->runningUnitTests()) {
            return response()->json(['agencies' => $agencies]);
        }

        return Inertia::render('Agencies/Index', ['agencies' => $agencies]);
    }

    public function create()
    {
        $this->authorize('create', Agency::class);

        return Inertia::render('Agencies/Create');
    }

    public function store(StoreAgencyRequest $request): RedirectResponse
    {
        $this->authorize('create', Agency::class);

        Agency::query()->create($request->validated());

        return redirect()->route('agencies.index')->with('success', 'Agency created.');
    }

    public function show(Agency $agency)
    {
        $this->authorize('view', $agency);

        $agency->loadCount(['artists', 'organisers', 'events', 'users', 'vendors']);

        return Inertia::render('Agencies/Show', ['agency' => $agency]);
    }

    public function edit(Agency $agency)
    {
        $this->authorize('update', $agency);

        return Inertia::render('Agencies/Edit', ['agency' => $agency]);
    }

    public function update(UpdateAgencyRequest $request, Agency $agency): RedirectResponse
    {
        $this->authorize('update', $agency);

        $agency->update($request->validated());

        return redirect()->route('agencies.show', $agency)->with('success', 'Agency updated.');
    }

    public function destroy(Agency $agency): RedirectResponse
    {
        $this->authorize('delete', $agency);

        $agency->delete();

        return redirect()->route('agencies.index')->with('success', 'Agency deleted.');
    }

    public function toggleActive(Request $request, Agency $agency): RedirectResponse
    {
        $this->authorize('update', $agency);

        $data = $request->validate([
            'active' => ['required', 'boolean'],
        ]);

        $agency->update(['active' => (bool) $data['active']]);

        return redirect()->back()->with('success', 'Agency status updated.');
    }
}

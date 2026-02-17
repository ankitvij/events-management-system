<?php

namespace App\Http\Controllers;

use App\Enums\VendorType;
use App\Http\Requests\StoreVendorRequest;
use App\Http\Requests\UpdateVendorRequest;
use App\Models\Vendor;
use App\Services\LocationResolver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorController extends Controller
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
        $this->authorize('viewAny', Vendor::class);

        $query = Vendor::query()->orderBy('name');
        $current = $request->user();

        if ($current && $current->hasRole('agency') && ! $current->hasRole(['admin', 'super_admin'])) {
            $query->where('agency_id', $current->agency_id);
        }

        if (! auth()->check()) {
            $query->where('active', true);
        }

        $search = $request->string('q')->toString();
        if ($search !== '') {
            $like = "%{$search}%";
            $query->where(function ($q) use ($like) {
                $q->where('name', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('city', 'like', $like)
                    ->orWhere('type', 'like', $like);
            });
        }

        $vendors = $query->paginate(20)->withQueryString();

        if ($request->expectsJson() || app()->runningUnitTests()) {
            return response()->json(['vendors' => $vendors]);
        }

        return Inertia::render('Vendors/Index', ['vendors' => $vendors]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Vendor::class);

        return Inertia::render('Vendors/Create', [
            'types' => VendorType::values(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreVendorRequest $request): RedirectResponse
    {
        $this->authorize('create', Vendor::class);

        $data = $request->validated();
        $locationIds = app(LocationResolver::class)->resolve($data['city'] ?? null, null);
        $data = array_merge($data, $locationIds);
        $data['active'] = (bool) ($data['active'] ?? false);
        $current = $request->user();
        if ($current && $current->hasRole('agency') && ! $current->hasRole(['admin', 'super_admin'])) {
            $data['agency_id'] = $current->agency_id;
        }

        $vendor = Vendor::query()->create($data);

        return redirect()->route('vendors.show', $vendor)->with('success', 'Vendor created.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Vendor $vendor)
    {
        $this->authorize('view', $vendor);

        $current = auth()->user();
        if ($current && $current->hasRole('agency') && ! $current->hasRole(['admin', 'super_admin']) && (int) ($vendor->agency_id ?? 0) !== (int) ($current->agency_id ?? 0)) {
            abort(404);
        }

        if (! auth()->check() && ! $vendor->active) {
            abort(404);
        }

        $vendor->load(['equipment', 'services']);

        return Inertia::render('Vendors/Show', ['vendor' => $vendor]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Vendor $vendor)
    {
        $this->authorize('update', $vendor);

        return Inertia::render('Vendors/Edit', [
            'vendor' => $vendor,
            'types' => VendorType::values(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateVendorRequest $request, Vendor $vendor): RedirectResponse
    {
        $this->authorize('update', $vendor);

        $data = $request->validated();
        $locationIds = app(LocationResolver::class)->resolve($data['city'] ?? null, null);
        $data = array_merge($data, $locationIds);
        $data['active'] = (bool) ($data['active'] ?? false);

        $vendor->update($data);

        return redirect()->route('vendors.show', $vendor)->with('success', 'Vendor updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Vendor $vendor): RedirectResponse
    {
        $this->authorize('delete', $vendor);

        $vendor->delete();

        return redirect()->route('vendors.index')->with('success', 'Vendor deleted.');
    }

    public function toggleActive(Request $request, Vendor $vendor): RedirectResponse
    {
        $this->authorize('update', $vendor);

        $data = $request->validate([
            'active' => ['required', 'boolean'],
        ]);

        $vendor->update(['active' => (bool) $data['active']]);

        return redirect()->back()->with('success', 'Vendor status updated.');
    }
}

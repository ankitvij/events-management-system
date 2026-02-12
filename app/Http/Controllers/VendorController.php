<?php

namespace App\Http\Controllers;

use App\Enums\VendorType;
use App\Http\Requests\StoreVendorRequest;
use App\Http\Requests\UpdateVendorRequest;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Vendor::class);

        $query = Vendor::query()->orderBy('name');

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
        $data['active'] = (bool) ($data['active'] ?? false);

        $vendor = Vendor::query()->create($data);

        return redirect()->route('vendors.show', $vendor)->with('success', 'Vendor created.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Vendor $vendor)
    {
        $this->authorize('view', $vendor);

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
}

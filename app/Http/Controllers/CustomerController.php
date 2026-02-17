<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Organiser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Customer::class);

        $query = Customer::orderBy('name');
        $current = $request->user();

        if ($current && ! $current->hasRole(['admin', 'super_admin', 'agency'])) {
            $organiserIds = Organiser::query()->where('email', $current->email)->pluck('id');

            if ($organiserIds->isNotEmpty()) {
                $query->whereHas('orders.items.event', function ($eventQuery) use ($organiserIds): void {
                    $eventQuery->whereIn('organiser_id', $organiserIds->all())
                        ->orWhereHas('organisers', function ($organiserQuery) use ($organiserIds): void {
                            $organiserQuery->whereIn('organisers.id', $organiserIds->all());
                        });
                });
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        $search = request('q', '');
        if ($search) {
            $like = "%{$search}%";
            $query->where(function ($q) use ($like) {
                $q->where('name', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('phone', 'like', $like);
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

        $customers = $query->paginate(20)->withQueryString();

        if ($request->expectsJson() || app()->runningUnitTests()) {
            return response()->json(['customers' => $customers]);
        }

        return Inertia::render('Customers/Index', ['customers' => $customers]);
    }

    public function create()
    {
        $this->authorize('create', Customer::class);

        return Inertia::render('Customers/Create');
    }

    public function store(\App\Http\Requests\StoreCustomerRequest $request): RedirectResponse
    {
        $this->authorize('create', Customer::class);

        Customer::create($request->validated());

        return redirect()->route('customers.index')->with('success', 'Customer created.');
    }

    public function show(Customer $customer)
    {
        $this->authorize('view', $customer);

        $current = auth()->user();
        if ($current && ! $current->hasRole(['admin', 'super_admin', 'agency'])) {
            $organiserIds = Organiser::query()->where('email', $current->email)->pluck('id');
            if ($organiserIds->isEmpty()) {
                abort(404);
            }

            $canAccess = $customer->orders()
                ->whereHas('items.event', function ($eventQuery) use ($organiserIds): void {
                    $eventQuery->whereIn('organiser_id', $organiserIds->all())
                        ->orWhereHas('organisers', function ($organiserQuery) use ($organiserIds): void {
                            $organiserQuery->whereIn('organisers.id', $organiserIds->all());
                        });
                })
                ->exists();

            if (! $canAccess) {
                abort(404);
            }
        }

        return Inertia::render('Customers/Show', ['customer' => $customer]);
    }

    public function edit(Customer $customer)
    {
        $this->authorize('update', $customer);

        return Inertia::render('Customers/Edit', ['customer' => $customer]);
    }

    public function update(\App\Http\Requests\UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $this->authorize('update', $customer);

        $customer->update($request->validated());

        return redirect()->route('customers.index')->with('success', 'Customer updated.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $this->authorize('delete', $customer);

        $customer->delete();

        return redirect()->route('customers.index')->with('success', 'Customer deleted.');
    }
}

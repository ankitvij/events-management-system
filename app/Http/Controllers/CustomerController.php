<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $this->authorize('viewAny', Customer::class);

        $customers = Customer::orderBy('name')->paginate(20);

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

<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Organiser;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $events = [];
        if ($user) {
            $events = Event::query()
                ->where('user_id', $user->id)
                ->where('start_at', '>=', now())
                ->orderBy('start_at')
                ->take(5)
                ->get();
        }

        $eventsTotal = Event::query()->count();
        $eventsActive = Event::query()->where('active', true)->count();
        $eventsUpcoming = Event::query()->where('start_at', '>=', now())->count();

        $ticketsTotal = (int) Ticket::query()->sum('quantity_total');
        $ticketsAvailable = (int) Ticket::query()->sum('quantity_available');
        $ticketsTypes = Ticket::query()->count();
        $ticketsActiveTypes = Ticket::query()->where('active', true)->count();

        $ordersTotal = Order::query()->count();
        $ordersPaid = Order::query()->where('paid', true)->count();
        $ordersCheckedIn = Order::query()->where('checked_in', true)->count();
        $salesTotal = (float) Order::query()->where('paid', true)->sum('total');
        $salesLast30 = (float) Order::query()->where('paid', true)->where('created_at', '>=', now()->subDays(30))->sum('total');
        $salesLast7 = (float) Order::query()->where('paid', true)->where('created_at', '>=', now()->subDays(7))->sum('total');

        $ordersLast7 = Order::query()->where('paid', true)->where('created_at', '>=', now()->subDays(7))->count();
        $ordersLast30 = Order::query()->where('paid', true)->where('created_at', '>=', now()->subDays(30))->count();

        $ticketsSold = (int) OrderItem::query()
            ->whereHas('order', fn ($query) => $query->where('paid', true))
            ->sum('quantity');

        $ticketsSoldLast7 = (int) OrderItem::query()
            ->whereHas('order', fn ($query) => $query->where('paid', true)->where('created_at', '>=', now()->subDays(7)))
            ->sum('quantity');

        $ticketsSoldLast30 = (int) OrderItem::query()
            ->whereHas('order', fn ($query) => $query->where('paid', true)->where('created_at', '>=', now()->subDays(30)))
            ->sum('quantity');

        $customersTotal = Customer::query()->count();
        $customersActive = Customer::query()->where('active', true)->count();
        $organisersTotal = Organiser::query()->count();

        $listLimit = 10;
        $lowInventoryThreshold = 10;

        $topEvents = OrderItem::query()
            ->select('event_id', DB::raw('sum(quantity) as tickets_sold'), DB::raw('sum(quantity * price) as revenue'))
            ->whereHas('order', fn ($query) => $query->where('paid', true))
            ->groupBy('event_id')
            ->orderByDesc('revenue')
            ->limit($listLimit)
            ->with(['event:id,title,slug,city,country'])
            ->get()
            ->map(fn ($row) => [
                'event' => $row->event ? [
                    'id' => $row->event->id,
                    'title' => $row->event->title,
                    'slug' => $row->event->slug,
                    'city' => $row->event->city,
                    'country' => $row->event->country,
                ] : null,
                'ticketsSold' => (int) $row->tickets_sold,
                'revenue' => (float) $row->revenue,
            ])
            ->values();

        $lowInventory = Ticket::query()
            ->with(['event:id,title,slug'])
            ->where('active', true)
            ->where('quantity_available', '<=', $lowInventoryThreshold)
            ->orderBy('quantity_available')
            ->limit($listLimit)
            ->get()
            ->map(fn (Ticket $ticket) => [
                'id' => $ticket->id,
                'name' => $ticket->name,
                'available' => (int) $ticket->quantity_available,
                'total' => (int) $ticket->quantity_total,
                'event' => $ticket->event ? [
                    'id' => $ticket->event->id,
                    'title' => $ticket->event->title,
                    'slug' => $ticket->event->slug,
                ] : null,
            ])
            ->values();

        $pendingOrdersQuery = Order::query()->where('paid', false);
        $pendingOrdersTotal = $pendingOrdersQuery->count();
        $pendingOrdersOverdueQuery = Order::query()->where('paid', false)->where('created_at', '<=', now()->subDay());
        $pendingOrdersOverdue = $pendingOrdersOverdueQuery->count();
        $pendingOrdersOverdueTotal = (float) $pendingOrdersOverdueQuery->sum('total');
        $pendingOrdersOldest = Order::query()->where('paid', false)->orderBy('created_at')->first();

        $stats = [
            'events' => [
                'total' => $eventsTotal,
                'active' => $eventsActive,
                'upcoming' => $eventsUpcoming,
                'inactive' => max($eventsTotal - $eventsActive, 0),
            ],
            'tickets' => [
                'types' => $ticketsTypes,
                'activeTypes' => $ticketsActiveTypes,
                'total' => $ticketsTotal,
                'available' => $ticketsAvailable,
                'sold' => max($ticketsTotal - $ticketsAvailable, 0),
                'soldPaid' => $ticketsSold,
            ],
            'orders' => [
                'total' => $ordersTotal,
                'paid' => $ordersPaid,
                'pending' => max($ordersTotal - $ordersPaid, 0),
                'checkedIn' => $ordersCheckedIn,
            ],
            'sales' => [
                'total' => $salesTotal,
                'last30Days' => $salesLast30,
                'last7Days' => $salesLast7,
                'averageOrder' => $ordersPaid > 0 ? round($salesTotal / $ordersPaid, 2) : 0,
            ],
            'trends' => [
                'ordersLast7Days' => $ordersLast7,
                'ordersLast30Days' => $ordersLast30,
                'ticketsSoldLast7Days' => $ticketsSoldLast7,
                'ticketsSoldLast30Days' => $ticketsSoldLast30,
            ],
            'people' => [
                'customers' => $customersTotal,
                'activeCustomers' => $customersActive,
                'organisers' => $organisersTotal,
            ],
            'topEvents' => $topEvents,
            'lowInventory' => $lowInventory,
            'pendingOrders' => [
                'total' => $pendingOrdersTotal,
                'overdue' => $pendingOrdersOverdue,
                'overdueTotal' => $pendingOrdersOverdueTotal,
                'oldestCreatedAt' => $pendingOrdersOldest?->created_at?->toDateTimeString(),
            ],
        ];

        return Inertia::render('dashboard', [
            'events' => $events,
            'stats' => $stats,
        ]);
    }
}

import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { Event } from '@/types/entities';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

type Props = {
    events?: Event[];
    stats: {
        events: {
            total: number;
            active: number;
            upcoming: number;
            inactive: number;
        };
        tickets: {
            types: number;
            activeTypes: number;
            total: number;
            available: number;
            sold: number;
            soldPaid: number;
        };
        orders: {
            total: number;
            paid: number;
            pending: number;
            checkedIn: number;
        };
        sales: {
            total: number;
            last30Days: number;
            last7Days: number;
            averageOrder: number;
        };
        trends: {
            ordersLast7Days: number;
            ordersLast30Days: number;
            ticketsSoldLast7Days: number;
            ticketsSoldLast30Days: number;
        };
        people: {
            customers: number;
            activeCustomers: number;
            organisers: number;
        };
        topEvents: Array<{
            event: {
                id: number;
                title: string;
                slug: string;
                city?: string | null;
                country?: string | null;
            } | null;
            ticketsSold: number;
            revenue: number;
        }>;
        lowInventory: Array<{
            id: number;
            name: string;
            available: number;
            total: number;
            event: {
                id: number;
                title: string;
                slug: string;
            } | null;
        }>;
        pendingOrders: {
            total: number;
            overdue: number;
            overdueTotal: number;
            oldestCreatedAt?: string | null;
        };
    };
};

const currencyFormatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-GB');

export default function Dashboard({ events = [], stats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Events</p>
                                <h2 className="mt-2 text-2xl font-serif font-semibold text-slate-900">Event Pulse</h2>
                            </div>
                            <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">Live</div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-slate-500">Total events</div>
                                <div className="text-2xl font-semibold text-slate-900">{numberFormatter.format(stats.events.total)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-500">Active now</div>
                                <div className="text-2xl font-semibold text-slate-900">{numberFormatter.format(stats.events.active)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-500">Upcoming</div>
                                <div className="text-2xl font-semibold text-slate-900">{numberFormatter.format(stats.events.upcoming)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-500">Inactive</div>
                                <div className="text-2xl font-semibold text-slate-900">{numberFormatter.format(stats.events.inactive)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-5 shadow-sm">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700/70">Sales</p>
                            <h2 className="mt-2 text-2xl font-serif font-semibold text-emerald-950">Orders + Revenue</h2>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-emerald-700/70">Paid revenue</div>
                                <div className="text-2xl font-semibold text-emerald-950">{currencyFormatter.format(stats.sales.total)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-emerald-700/70">Last 30 days</div>
                                <div className="text-2xl font-semibold text-emerald-950">{currencyFormatter.format(stats.sales.last30Days)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-emerald-700/70">Last 7 days</div>
                                <div className="text-2xl font-semibold text-emerald-950">{currencyFormatter.format(stats.sales.last7Days)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-emerald-700/70">Orders paid</div>
                                <div className="text-2xl font-semibold text-emerald-950">{numberFormatter.format(stats.orders.paid)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-emerald-700/70">Avg order</div>
                                <div className="text-2xl font-semibold text-emerald-950">{currencyFormatter.format(stats.sales.averageOrder)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 via-white to-indigo-100 p-5 shadow-sm">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-indigo-600/70">Tickets</p>
                            <h2 className="mt-2 text-2xl font-serif font-semibold text-indigo-950">Inventory</h2>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-indigo-600/70">Ticket types</div>
                                <div className="text-2xl font-semibold text-indigo-950">{numberFormatter.format(stats.tickets.types)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-indigo-600/70">Active types</div>
                                <div className="text-2xl font-semibold text-indigo-950">{numberFormatter.format(stats.tickets.activeTypes)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-indigo-600/70">Available seats</div>
                                <div className="text-2xl font-semibold text-indigo-950">{numberFormatter.format(stats.tickets.available)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-indigo-600/70">Sold (paid)</div>
                                <div className="text-2xl font-semibold text-indigo-950">{numberFormatter.format(stats.tickets.soldPaid)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-amber-100 p-5 shadow-sm">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-amber-700/70">People</p>
                            <h2 className="mt-2 text-2xl font-serif font-semibold text-amber-950">Customers + Organisers</h2>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-amber-700/70">Customers</div>
                                <div className="text-2xl font-semibold text-amber-950">{numberFormatter.format(stats.people.customers)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-amber-700/70">Active customers</div>
                                <div className="text-2xl font-semibold text-amber-950">{numberFormatter.format(stats.people.activeCustomers)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-amber-700/70">Organisers</div>
                                <div className="text-2xl font-semibold text-amber-950">{numberFormatter.format(stats.people.organisers)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-amber-700/70">Orders pending</div>
                                <div className="text-2xl font-semibold text-amber-950">{numberFormatter.format(stats.orders.pending)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {/* Upcoming events list */}
                    <div>
                        <h2 className="text-lg font-semibold">Upcoming Events</h2>

                        {events.length === 0 ? (
                            <div className="text-sm text-muted mt-2">No upcoming events.</div>
                        ) : (
                            <div className="grid gap-3 mt-2">
                                {events.map((event: Event) => (
                                    <div key={event.id} className="border rounded p-3 flex justify-between items-start">
                                        <div>
                                            <Link href={`/${event.slug}`} className="text-base font-medium">{event.title}</Link>
                                            <div className="text-sm text-muted">{event.city ?? ''}{event.city && event.country ? ', ' : ''}{event.country ?? ''}</div>
                                            <div className="text-sm text-muted">{new Date(event.start_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
                        <h2 className="text-lg font-semibold">Orders Snapshot</h2>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-lg bg-slate-50 p-3">
                                <div className="text-slate-500">Total orders</div>
                                <div className="text-xl font-semibold text-slate-900">{numberFormatter.format(stats.orders.total)}</div>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3">
                                <div className="text-slate-500">Checked in</div>
                                <div className="text-xl font-semibold text-slate-900">{numberFormatter.format(stats.orders.checkedIn)}</div>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3">
                                <div className="text-slate-500">Tickets sold</div>
                                <div className="text-xl font-semibold text-slate-900">{numberFormatter.format(stats.tickets.sold)}</div>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3">
                                <div className="text-slate-500">Available tickets</div>
                                <div className="text-xl font-semibold text-slate-900">{numberFormatter.format(stats.tickets.available)}</div>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-lg bg-slate-50 p-3">
                                <div className="text-slate-500">Orders (7d)</div>
                                <div className="text-xl font-semibold text-slate-900">{numberFormatter.format(stats.trends.ordersLast7Days)}</div>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3">
                                <div className="text-slate-500">Orders (30d)</div>
                                <div className="text-xl font-semibold text-slate-900">{numberFormatter.format(stats.trends.ordersLast30Days)}</div>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3">
                                <div className="text-slate-500">Tickets sold (7d)</div>
                                <div className="text-xl font-semibold text-slate-900">{numberFormatter.format(stats.trends.ticketsSoldLast7Days)}</div>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3">
                                <div className="text-slate-500">Tickets sold (30d)</div>
                                <div className="text-xl font-semibold text-slate-900">{numberFormatter.format(stats.trends.ticketsSoldLast30Days)}</div>
                            </div>
                        </div>
                        <div className="mt-4 rounded-lg border border-amber-200/60 bg-amber-50 p-3 text-sm">
                            <div className="text-amber-800">Pending orders: {numberFormatter.format(stats.pendingOrders.total)}</div>
                            <div className="text-amber-800">Overdue (24h+): {numberFormatter.format(stats.pendingOrders.overdue)}</div>
                            <div className="text-amber-800">Overdue total: {currencyFormatter.format(stats.pendingOrders.overdueTotal)}</div>
                            {stats.pendingOrders.oldestCreatedAt ? (
                                <div className="text-amber-800">Oldest pending: {new Date(stats.pendingOrders.oldestCreatedAt).toLocaleString()}</div>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
                        <h2 className="text-lg font-semibold">Top Events</h2>
                        {stats.topEvents.length === 0 ? (
                            <div className="text-sm text-muted mt-2">No paid orders yet.</div>
                        ) : (
                            <div className="mt-3 space-y-3">
                                {stats.topEvents.map((row, index) => (
                                    <div key={`${row.event?.id ?? index}`} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                        <div>
                                            {row.event ? (
                                                <Link href={`/${row.event.slug}`} className="text-sm font-medium text-slate-900">{row.event.title}</Link>
                                            ) : (
                                                <div className="text-sm font-medium text-slate-900">Event removed</div>
                                            )}
                                            <div className="text-xs text-slate-500">{row.event?.city ?? '—'}{row.event?.country ? `, ${row.event.country}` : ''}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold text-slate-900">{numberFormatter.format(row.ticketsSold)} sold</div>
                                            <div className="text-xs text-slate-500">{currencyFormatter.format(row.revenue)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
                        <h2 className="text-lg font-semibold">Low Inventory</h2>
                        {stats.lowInventory.length === 0 ? (
                            <div className="text-sm text-muted mt-2">No low inventory tickets.</div>
                        ) : (
                            <div className="mt-3 space-y-3">
                                {stats.lowInventory.map((row) => (
                                    <div key={row.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                        <div>
                                            {row.event ? (
                                                <Link href={`/${row.event.slug}`} className="text-sm font-medium text-slate-900">{row.event.title}</Link>
                                            ) : (
                                                <div className="text-sm font-medium text-slate-900">Event removed</div>
                                            )}
                                            <div className="text-xs text-slate-500">{row.name}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold text-rose-600">{numberFormatter.format(row.available)} left</div>
                                            <div className="text-xs text-slate-500">{numberFormatter.format(row.total)} total</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

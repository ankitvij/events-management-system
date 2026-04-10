import { Head, Link, router, usePage } from '@inertiajs/react';
import CompactPagination from '@/components/compact-pagination';
import AppLayout from '@/layouts/app-layout';

export default function OrdersIndex() {
    const page = usePage<{
        orders?: { data?: any[]; links?: any[] };
        auth?: { user?: { role?: string; is_super_admin?: boolean } | null };
        organiser?: { id: number } | null;
    }>();
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const orders = page.props?.orders ?? { data: [], links: [] };
    const role = page.props?.auth?.user?.role ?? '';
    const canManageStatus = Boolean(
        page.props?.auth?.user?.is_super_admin
        || role === 'admin'
        || role === 'agency'
        || role === 'organiser'
        || page.props?.organiser,
    );

    const orderStatusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'partially_paid', label: 'Partially paid' },
        { value: 'paid', label: 'Fully paid' },
        { value: 'not_paid', label: 'Not paid' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' },
        { value: 'cancelled', label: 'Cancelled' },
    ] as const;

    function applySort(key: string) {
        const cur = params?.get('sort') ?? '';
        let next = '';
        if (cur === `${key}_asc`) {
            next = `${key}_desc`;
        } else if (cur === `${key}_desc`) {
            next = '';
        } else {
            next = `${key}_asc`;
        }

        applyFilters({ sort: next || null, page: null });
    }

    function applyFilters(updates: Record<string, string | null>) {
        if (typeof window === 'undefined') {
            return;
        }

        const sp = new URLSearchParams(window.location.search);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') {
                sp.delete(key);
            } else {
                sp.set(key, value);
            }
        });

        router.get(`/orders${sp.toString() ? `?${sp.toString()}` : ''}`);
    }

    function eventName(order: any): string {
        const names = Array.from(
            new Set(((order.items ?? []) as any[]).map((item: any) => item?.event?.title).filter(Boolean))
        ) as string[];

        if (names.length === 0) {
            return '—';
        }

        if (names.length === 1) {
            return names[0];
        }

        return `${names[0]} +${names.length - 1}`;
    }

    function customerName(order: any): string {
        return order.contact_name || order.customer?.name || order.user?.name || '—';
    }

    function customerEmail(order: any): string {
        return order.contact_email || order.customer?.email || order.user?.email || '—';
    }

    function orderStatusLabel(order: any): string {
        if (order?.payment_status === 'cancelled') {
            return 'Cancelled';
        }

        if (order?.payment_status === 'failed') {
            return 'Failed';
        }

        if (order?.payment_status === 'refunded') {
            return 'Refunded';
        }

        if (order?.payment_status === 'paid') {
            return 'Fully paid';
        }

        if (order?.payment_status === 'partially_paid') {
            return 'Partially paid';
        }

        if (order?.payment_status === 'not_paid') {
            return 'Not paid';
        }

        return 'Pending';
    }

    function orderStatusClasses(order: any): string {
        if (order?.payment_status === 'cancelled') {
            return 'bg-[#fee2e2] text-[#991b1b]';
        }

        if (order?.payment_status === 'failed') {
            return 'bg-[#ffedd5] text-[#9a3412]';
        }

        if (order?.payment_status === 'refunded') {
            return 'bg-[#e0e7ff] text-[#3730a3]';
        }

        if (order?.payment_status === 'paid') {
            return 'bg-[#dcfce7] text-[#166534]';
        }

        if (order?.payment_status === 'partially_paid') {
            return 'bg-[#fde68a] text-[#92400e]';
        }

        if (order?.payment_status === 'not_paid') {
            return 'bg-[#f3f4f6] text-[#374151]';
        }

        return 'bg-[#fef3c7] text-[#92400e]';
    }

    function updatePaymentStatus(orderId: number, paymentStatus: string) {
        router.put(`/orders/${orderId}/payment-status`, {
            payment_status: paymentStatus,
        }, {
            preserveScroll: true,
        });
    }

    function selectedOrderStatusValue(order: any): string {
        return order?.payment_status ?? 'pending';
    }

    return (
        <AppLayout>
            <Head title="Orders" />

            <div className="p-4">
                <h1 className="text-xl font-semibold">Orders</h1>

                <div className="mt-4 rounded-xl border border-[#c0cbd9] bg-[#eef2f7] p-3 shadow-sm">
                    <div className="md:hidden">
                        <input
                            value={params?.get('q') ?? ''}
                            onChange={(e) => applyFilters({ q: e.target.value || null, page: null })}
                            placeholder="Search orders..."
                            className="input w-full !bg-white"
                        />
                    </div>
                    <CompactPagination links={orders.links} className="mt-2 justify-center md:justify-start" />
                </div>

                <div className="mt-4 mb-2 hidden rounded-xl border border-[#c0cbd9] bg-[#eef2f7] p-3 text-sm text-muted md:grid md:grid-cols-12 md:gap-3">
                    <div className="md:col-span-4 flex items-center gap-3">
                        <button onClick={() => applySort('booking_code')} className="btn-primary shrink-0">
                            Booking code
                            <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('booking_code_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>
                        <input
                            value={params?.get('q') ?? ''}
                            onChange={(e) => applyFilters({ q: e.target.value || null, page: null })}
                            placeholder="Search orders..."
                            className="input w-full !bg-white"
                        />
                    </div>
                    <button onClick={() => applySort('event')} className="btn-primary md:col-span-2 w-full justify-start">
                        Event name
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('event_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                    <button onClick={() => applySort('email')} className="btn-primary md:col-span-2 w-full justify-start">
                        Customer email
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('email_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                    <button onClick={() => applySort('value')} className="btn-primary md:col-span-1 w-full justify-end text-right">
                        Value
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('value_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                    <button onClick={() => applySort('status')} className="btn-primary md:col-span-2 w-full justify-start">
                        Order status
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('status_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                    <button onClick={() => applySort('date')} className="btn-primary md:col-span-1 w-full justify-end text-right">
                        Order date
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('date_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                </div>

                <div className="space-y-3">
                    {orders.data?.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#c0cbd9] bg-[#eef2f7] p-4 text-sm text-muted">No orders yet.</div>
                    ) : (
                        orders.data?.map((order: any) => (
                            <Link key={order.id} href={`/orders/${order.id}`} className="box block border-[#c0cbd9] bg-[#eef2f7] !px-2 transition hover:opacity-90">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-center">
                                    <div className="md:col-span-4 px-3">
                                        <span className="font-semibold">{order.booking_code || '—'}</span>
                                        <div className="text-sm text-muted">{customerName(order)}</div>
                                    </div>
                                    <div className="md:col-span-2 px-3 text-sm">{eventName(order)}</div>
                                    <div className="md:col-span-2 px-3 text-sm text-muted break-all">{customerEmail(order)}</div>
                                    <div className="md:col-span-1 px-3 text-sm text-right">€{Number(order.total ?? 0).toFixed(2)}</div>
                                    <div className={`md:col-span-2 px-3 py-2 text-sm font-semibold rounded-md ${orderStatusClasses(order)}`}>
                                        {canManageStatus ? (
                                            <select
                                                value={selectedOrderStatusValue(order)}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                onChange={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    updatePaymentStatus(order.id, e.target.value);
                                                }}
                                                className="input h-8 w-full !border-white/40 !bg-white/90 !px-2 !py-0 text-xs !text-[#111827]"
                                                aria-label={`Change payment status for order ${order.booking_code || order.id}`}
                                            >
                                                {orderStatusOptions.map((statusOption) => (
                                                    <option key={statusOption.value} value={statusOption.value}>
                                                        {statusOption.label}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span>{orderStatusLabel(order)}</span>
                                        )}
                                    </div>
                                    <div className="md:col-span-1 px-3 text-sm text-right text-muted">{order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                <div className="mt-4">
                    <CompactPagination links={orders.links} className="justify-center md:justify-start" />
                </div>
            </div>
        </AppLayout>
    );
}

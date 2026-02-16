import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

type GuestDetail = {
    name: string | null;
    email: string | null;
};

type Ticket = {
    name?: string | null;
};

type EventInfo = {
    title?: string | null;
    start_at?: string | null;
    image_thumbnail_url?: string | null;
    image_url?: string | null;
};

type OrderItem = {
    id: number;
    quantity: number;
    checked_in_quantity?: number | null;
    price: number;
    ticket?: Ticket | null;
    event?: EventInfo | null;
    guest_details?: GuestDetail[] | null;
};

type PaymentDetails = {
    display_name?: string;
    account_name?: string;
    iban?: string;
    bic?: string;
    account_id?: string;
    instructions?: string;
    reference_hint?: string;
};

type OrderUser = {
    name?: string | null;
    email?: string | null;
};

type OrderCustomer = {
    id?: number | null;
    name?: string | null;
    email?: string | null;
};

type Order = {
    id: number;
    status?: string | null;
    session_id?: string | null;
    booking_code: string;
    contact_email?: string | null;
    contact_name?: string | null;
    user?: OrderUser | null;
    customer?: OrderCustomer | null;
    items: OrderItem[];
    payment_method?: string | null;
    payment_status?: string | null;
    paid?: boolean | null;
    checked_in?: boolean | null;
    total?: number | null;
    created_at?: string | null;
};

type PageProps = {
    order?: Order | null;
    payment_details?: PaymentDetails | null;
    flash?: {
        success?: string;
    };
};

function resolveStoragePath(path?: string | null): string {
    if (!path) {
        return '/images/default-event.svg';
    }

    if (path.startsWith('http')) {
        return path;
    }

    if (path.startsWith('/storage/')) {
        return path;
    }

    if (path.startsWith('storage/')) {
        return `/${path}`;
    }

    return `/storage/${path}`;
}

export default function OrdersShow() {
    const page = usePage<PageProps>();
    const order = page.props.order ?? null;
    const items: OrderItem[] = Array.isArray(order?.items) ? order.items : [];
    const authUser = (page.props as { auth?: { user?: { id: number; is_super_admin?: boolean } } }).auth?.user;

    const baseDownloadParams = (() => {
        if (!order?.booking_code) return '';
        const params = new URLSearchParams();
        params.set('booking_code', order.booking_code);
        const email = order.contact_email ?? order.user?.email;
        if (email) {
            params.set('email', email);
        }
        const query = params.toString();
        return query ? `?${query}` : '';
    })();

    const downloadAllUrl = order?.id ? `/orders/${order.id}/tickets/download-all${baseDownloadParams}` : '#';
    const totalTickets = items.reduce((sum: number, it: OrderItem) => sum + (Number(it?.quantity) || 1), 0);
    const orderEmail = order?.contact_email ?? order?.user?.email ?? null;
    const csrfToken = typeof document !== 'undefined'
        ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        : '';

    const invalidPaymentStatuses = new Set(['not_paid', 'failed', 'refunded']);
    const isInvalidByPayment = invalidPaymentStatuses.has(order?.payment_status ?? '');

    const paymentStatusLabel: Record<string, string> = {
        pending: 'Pending',
        paid: 'Paid',
        not_paid: 'Not paid',
        failed: 'Failed',
        refunded: 'Refunded',
    };

    const ticketRows = items.flatMap((item) => {
        const quantity = Math.max(1, Number(item.quantity) || 1);
        const checkedInQuantity = Math.min(quantity, Math.max(0, Number(item.checked_in_quantity ?? 0)));
        const guestDetails = Array.isArray(item.guest_details) ? item.guest_details : [];
        const eventStart = item.event?.start_at ? new Date(item.event.start_at) : null;
        const isExpired = Boolean(eventStart && eventStart.getTime() < Date.now());

        return Array.from({ length: quantity }, (_, index) => {
            const guest = guestDetails[index] ?? null;
            const checkedIn = index < checkedInQuantity;

            return {
                key: `${item.id}-${index + 1}`,
                itemId: item.id,
                ticketIndex: index + 1,
                eventTitle: item.event?.title ?? 'Event',
                ticketName: item.ticket?.name ?? 'Ticket',
                guestName: guest?.name ?? null,
                guestEmail: guest?.email ?? null,
                price: Number(item.price) || 0,
                isCheckedIn: checkedIn,
                isExpired,
            };
        });
    });

    const paymentStatus = order?.payment_status ?? 'pending';

    if (!order) {
        return (
            <AppLayout>
                <Head title="Order" />
                <div className="p-4 text-sm">
                    <div className="rounded-md bg-red-600 p-3 text-sm text-white">
                        Unable to load order details. Please check your booking code.
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title={`Booking code: ${order.booking_code ?? 'Order'}`} />

            {page.props?.flash?.success && (
                <div className="p-4 text-sm">
                    <div className="rounded-md bg-green-600 p-3 text-white">
                        <div className="font-semibold">Thank you for your order.</div>
                        <div className="text-sm opacity-90">{page.props.flash.success}</div>
                    </div>
                </div>
            )}

            <div className="p-4 text-sm space-y-4">
                <div className="space-y-2">
                    <div>
                        <button type="button" className="btn-secondary" onClick={() => window.history.back()} aria-label="Go back" title="Go back">
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </div>
                    <h1 className="text-xl font-semibold">Booking code: {order.booking_code ?? '—'}</h1>
                    <div className="text-sm text-muted">
                        Placed on:{' '}
                        {order.created_at
                            ? new Date(order.created_at).toLocaleString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                              })
                            : ''}
                    </div>
                    {order.payment_method && (
                        <div className="mt-2 space-y-1 text-sm">
                            <div className="font-semibold">
                                Payment method: {order.payment_method.replace('_', ' ')}
                            </div>
                            <div className="text-muted">
                                Status: {paymentStatusLabel[paymentStatus] ?? paymentStatus}
                            </div>
                        </div>
                    )}
                    {authUser && (
                        <div className="box space-y-2">
                            <div className="text-sm font-semibold">Order details</div>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-1 md:grid-cols-2">
                                <div><strong>Order ID:</strong> {order.id}</div>
                                <div><strong>Status:</strong> {order.status ?? '—'}</div>
                                <div><strong>Booking code:</strong> {order.booking_code ?? '—'}</div>
                                <div><strong>Session ID:</strong> {order.session_id ?? '—'}</div>
                                <div><strong>Contact name:</strong> {order.contact_name ?? '—'}</div>
                                <div><strong>Contact email:</strong> {order.contact_email ?? '—'}</div>
                                <div><strong>User:</strong> {order.user?.name ?? '—'}</div>
                                <div><strong>User email:</strong> {order.user?.email ?? '—'}</div>
                                <div><strong>Customer ID:</strong> {order.customer?.id ?? '—'}</div>
                                <div><strong>Customer:</strong> {order.customer?.name ?? '—'}</div>
                                <div><strong>Customer email:</strong> {order.customer?.email ?? '—'}</div>
                                <div><strong>Paid:</strong> {order.paid ? 'Yes' : 'No'}</div>
                                <div><strong>Checked in:</strong> {order.checked_in ? 'Yes' : 'No'}</div>
                                <div><strong>Payment method:</strong> {order.payment_method ?? '—'}</div>
                                <div><strong>Payment status:</strong> {paymentStatusLabel[paymentStatus] ?? paymentStatus}</div>
                                <div><strong>Created at:</strong> {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</div>
                            </div>
                        </div>
                    )}
                    {authUser && (
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                            <form method="post" action={`/orders/${order.id}/payment-status`} className="flex items-center gap-2">
                                <input type="hidden" name="_method" value="put" />
                                <input type="hidden" name="_token" value={csrfToken} />
                                <select name="payment_status" aria-label="Payment status" defaultValue={paymentStatus} className="input h-9 w-44">
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="not_paid">Not paid</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                                <button type="submit" className="btn-primary">Update payment status</button>
                            </form>
                            {order.checked_in ? (
                                <span className="text-xs rounded bg-yellow-100 text-yellow-800 px-2 py-1">Checked in — tickets invalid</span>
                            ) : null}
                        </div>
                    )}
                    {orderEmail && <div className="text-sm text-muted">Confirmation sent to: <strong className="text-black dark:text-white">{orderEmail}</strong></div>}
                    {totalTickets > 1 && (
                        <div className="flex flex-wrap gap-2">
                            <a href={downloadAllUrl} className="btn-download">
                                Download all tickets
                            </a>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    {ticketRows.map((row) => {
                        const status = row.isCheckedIn
                            ? { label: 'Checked in', classes: 'border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200' }
                            : row.isExpired
                                ? { label: 'Expired', classes: 'border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200' }
                                : isInvalidByPayment
                                    ? { label: 'Invalid', classes: 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200' }
                                    : { label: 'Valid', classes: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200' };

                        const params = new URLSearchParams(baseDownloadParams.replace(/^\?/, ''));
                        params.set('ticket_index', String(row.ticketIndex));
                        if (row.guestEmail) {
                            params.set('email', row.guestEmail);
                        }

                        const downloadUrl = `/orders/${order.id}/tickets/${row.itemId}/download?${params.toString()}`;
                        const canCheckIn = authUser && !row.isCheckedIn && !row.isExpired && !isInvalidByPayment;
                        const sourceItem = items.find((item) => item.id === row.itemId);
                        const eventThumbnail = sourceItem?.event?.image_thumbnail_url
                            ? resolveStoragePath(sourceItem.event.image_thumbnail_url)
                            : null;

                        return (
                            <div key={row.key} className={`box border ${status.classes}`}>
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex items-start gap-3">
                                        {eventThumbnail && (
                                            <img src={eventThumbnail} alt={row.eventTitle} className="h-12 w-20 rounded object-cover" />
                                        )}
                                        <div className="space-y-1">
                                        <div className="font-semibold">
                                            {row.eventTitle} — {row.ticketName} #{row.ticketIndex}
                                        </div>
                                        <div className="text-xs opacity-90">
                                            {row.guestName ? row.guestName : 'Ticket holder not set'}
                                            {row.guestEmail ? ` • ${row.guestEmail}` : ''}
                                        </div>
                                        <div className="text-xs font-semibold">{status.label}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {authUser && (
                                            <form method="post" action={`/orders/${order.id}/items/${row.itemId}/send-ticket`}>
                                                <input type="hidden" name="_token" value={csrfToken} />
                                                <input type="hidden" name="ticket_index" value={row.ticketIndex} />
                                                {row.guestEmail && <input type="hidden" name="email" value={row.guestEmail} />}
                                                <button type="submit" className="btn-primary">Resend ticket</button>
                                            </form>
                                        )}
                                        <a href={downloadUrl} className="btn-download">Download ticket</a>
                                        {authUser && canCheckIn ? (
                                            <form method="post" action={`/orders/${order.id}/items/${row.itemId}/check-in`}>
                                                <input type="hidden" name="_method" value="put" />
                                                <input type="hidden" name="_token" value={csrfToken} />
                                                <button type="submit" className="btn-confirm">Check in ticket</button>
                                            </form>
                                        ) : authUser ? (
                                            <button type="button" className="btn-confirm opacity-50" disabled>
                                                Check in ticket
                                            </button>
                                        ) : null}
                                        <span className="text-sm font-semibold">€{row.price.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <div className="text-lg font-medium">Total: €{Number(order.total ?? 0).toFixed(2)}</div>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
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

type Order = {
    id: number;
    booking_code: string;
    contact_email?: string | null;
    contact_name?: string | null;
    user?: OrderUser | null;
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

export default function OrdersShow() {
    const page = usePage<PageProps>();
    const order = page.props.order ?? null;
    const paymentDetails = page.props.payment_details;
    const items: OrderItem[] = Array.isArray(order?.items) ? order.items : [];

    const downloadParams = (() => {
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

    const downloadAllUrl = order?.id ? `/orders/${order.id}/tickets/download-all${downloadParams}` : '#';
    const totalTickets = items.reduce((sum: number, it: OrderItem) => sum + (Number(it?.quantity) || 1), 0);
    const orderEmail = order?.contact_email ?? order?.user?.email ?? null;
    const authUser = (page.props as { auth?: { user?: { id: number; is_super_admin?: boolean } } }).auth?.user;
    const csrfToken = typeof document !== 'undefined'
        ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        : '';

    const [guestDetails, setGuestDetails] = useState<GuestDetail[][]>(() => {
        return items.map(it => (Array.isArray(it.guest_details) ? [...it.guest_details] : []));
    });
    const [saving, setSaving] = useState<number | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    const handleGuestDetailChange = (itemIdx: number, guestIdx: number, field: 'name' | 'email', value: string) => {
        setGuestDetails(prev =>
            prev.map((guests, idx) => {
                if (idx !== itemIdx) return guests;
                return guests.map((g, gidx) => (gidx === guestIdx ? { ...g, [field]: value } : g));
            })
        );
    };

    const handleSaveGuestDetails = async (itemIdx: number, itemId: number) => {
        setSaving(itemId);
        setSaveError(null);
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch(`/orders/${order.id}/items/${itemId}/ticket-holder`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                    Accept: 'application/json',
                },
                body: JSON.stringify({ guest_details: guestDetails[itemIdx] }),
            });
            if (!res.ok) throw new Error(await res.text());
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save';
            setSaveError(message);
        } finally {
            setSaving(null);
        }
    };

    const sendTickets = async (initialEmail?: string | null): Promise<void> => {
        if (order.checked_in) {
            alert('Tickets for this order are already checked in and no longer valid.');
            return;
        }

        const email = initialEmail || window.prompt('Email to send tickets to');
        if (!email) {
            alert('Email is required');
            return;
        }
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch('/orders/send-ticket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                    Accept: 'application/json',
                },
                body: JSON.stringify({ booking_code: order.booking_code, email }),
            });
            if (!res.ok) throw new Error(await res.text());
            alert('Tickets emailed successfully');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to send ticket to email';
            alert(message);
        }
    };

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
                                Payment method: {paymentDetails?.display_name || order.payment_method.replace('_', ' ')}
                            </div>
                            <div className="text-muted">
                                Status: {order.payment_status === 'paid' || order.paid ? 'Paid' : 'Pending payment'}
                            </div>
                            {paymentDetails && (
                                <div className="rounded-md border border-border bg-muted/30 p-3 leading-relaxed">
                                    {order.payment_method === 'bank_transfer' && (
                                        <>
                                            <div><strong>Account name:</strong> {paymentDetails.account_name}</div>
                                            <div><strong>IBAN:</strong> {paymentDetails.iban}</div>
                                            <div><strong>BIC/SWIFT:</strong> {paymentDetails.bic}</div>
                                        </>
                                    )}
                                    {(order.payment_method === 'paypal_transfer' || order.payment_method === 'revolut_transfer') && (
                                        <div><strong>Account ID:</strong> {paymentDetails.account_id}</div>
                                    )}
                                    {paymentDetails.instructions && <div className="mt-2 text-sm">{paymentDetails.instructions}</div>}
                                    {paymentDetails.reference_hint && <div className="mt-1 text-xs text-muted">{paymentDetails.reference_hint}</div>}
                                </div>
                            )}
                        </div>
                    )}
                    {authUser && (
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                            {!(order.payment_status === 'paid' || order.paid) && (
                                <form method="post" action={`/orders/${order.id}/payment-received`}>
                                    <input type="hidden" name="_method" value="put" />
                                    <input type="hidden" name="_token" value={csrfToken} />
                                    <button type="submit" className="btn-primary">Mark payment received</button>
                                </form>
                            )}
                            {!order.checked_in ? (
                                <form method="post" action={`/orders/${order.id}/check-in`}>
                                    <input type="hidden" name="_method" value="put" />
                                    <input type="hidden" name="_token" value={csrfToken} />
                                    <button type="submit" className="btn-confirm">Check in tickets</button>
                                </form>
                            ) : (
                                <span className="text-xs rounded bg-yellow-100 text-yellow-800 px-2 py-1">Checked in — tickets invalid</span>
                            )}
                        </div>
                    )}
                    {orderEmail && (
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                            <span>Confirmation sent to:</span>
                            <strong className="text-sm font-semibold text-black dark:text-white">{orderEmail}</strong>
                            <button type="button" className="btn-confirm" onClick={() => sendTickets(orderEmail)}>
                                Resend tickets
                            </button>
                        </div>
                    )}
                    {totalTickets > 1 && (
                        <div className="flex flex-wrap gap-2">
                            <a href={downloadAllUrl} className="btn-download">
                                Download all tickets
                            </a>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    {items.map((it: OrderItem, itemIdx: number) => {
                        const guests: GuestDetail[] = Array.isArray(guestDetails[itemIdx]) ? guestDetails[itemIdx] : [];
                        const defaultEmail = guests.length > 0 ? guests[0]?.email ?? null : null;

                        return (
                            <div key={it.id} className="box">
                                <div className="flex flex-col gap-3 min-[700px]:flex-row min-[700px]:items-start min-[700px]:justify-between">
                                    <div className="flex-1 space-y-3">
                                        {(it.event?.image_thumbnail_url || it.event?.image_url) && (
                                            <img
                                                src={it.event?.image_thumbnail_url ?? it.event?.image_url}
                                                alt={it.event?.title}
                                                className="w-full rounded min-[600px]:w-auto"
                                            />
                                        )}
                                        <div className="text-left mt-2 min-[700px]:mt-3">
                                            <div className="font-medium">{it.event?.title ?? it.ticket?.name ?? 'Item'}</div>
                                            <div className="text-sm text-muted">
                                                {it.ticket?.name ? `Ticket type: ${it.ticket.name}` : 'Ticket type'}
                                            </div>
                                            {guests.length > 0 && (
                                                <div className="space-y-2 mt-2">
                                                    {guests.map((g: GuestDetail, guestIdx: number) => (
                                                        <div key={guestIdx} className="flex flex-col gap-2">
                                                            <input
                                                                type="text"
                                                                value={g.name || ''}
                                                                onChange={e => handleGuestDetailChange(itemIdx, guestIdx, 'name', e.target.value)}
                                                                className="border rounded px-2 py-1 text-sm w-[300px]"
                                                                placeholder="Ticket holder name"
                                                            />
                                                            <input
                                                                type="email"
                                                                value={g.email || ''}
                                                                onChange={e => handleGuestDetailChange(itemIdx, guestIdx, 'email', e.target.value)}
                                                                className="border rounded px-2 py-1 text-sm w-[300px]"
                                                                placeholder="Ticket holder email (optional)"
                                                            />
                                                        </div>
                                                    ))}
                                                    <div className="mt-2">
                                                        <button
                                                            type="button"
                                                            className={`btn-primary ${saving === it.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                            disabled={saving === it.id}
                                                            onClick={() => handleSaveGuestDetails(itemIdx, it.id)}
                                                        >
                                                            {saving === it.id ? 'Saving...' : 'Update this ticket'}
                                                        </button>
                                                    </div>
                                                    {saveError && saving === it.id && (
                                                        <div className="text-sm text-red-600 mt-1">{saveError}</div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="mt-3">
                                                <button
                                                    type="button"
                                                    className="btn-confirm"
                                                    onClick={() => sendTickets(defaultEmail || orderEmail)}
                                                >
                                                    Email this ticket
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-[700px]:ml-6 flex flex-col items-end gap-3 mt-3 min-[700px]:mt-5">
                                        <a
                                            href={`/orders/${order.id}/tickets/${it.id}/download${downloadParams}`}
                                            className="btn-download"
                                        >
                                            {it.quantity && it.quantity > 1 ? 'Download tickets' : 'Download ticket'}
                                        </a>
                                        <div className="text-lg font-semibold">€{Number(it.price).toFixed(2)}</div>
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

/* SendTicketButton removed (send ticket functionality removed from this page) */

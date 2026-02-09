import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import React from 'react';
import { useState } from 'react';

export default function OrdersShow() {
    const page = usePage();
    const order = (page.props as any)?.order ?? null;
    const items = Array.isArray(order?.items) ? order.items : [];

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
    const totalTickets = items.reduce((sum: number, it: any) => sum + (Number(it?.quantity) || 1), 0);
    const orderEmail = order?.contact_email ?? order?.user?.email ?? null;

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

    // Editable guest details state
    const [guestDetails, setGuestDetails] = useState(() => {
        return items.map((it: any) => Array.isArray(it.guest_details) ? [...it.guest_details] : []);
    });
    const [saving, setSaving] = useState<number | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    const handleGuestDetailChange = (itemIdx: number, guestIdx: number, field: 'name' | 'email', value: string) => {
        setGuestDetails(prev => prev.map((guests, idx) => {
            if (idx !== itemIdx) return guests;
            return guests.map((g, gidx) => gidx === guestIdx ? { ...g, [field]: value } : g);
        }));
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
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ guest_details: guestDetails[itemIdx] }),
            });
            if (!res.ok) throw new Error(await res.text());
            // Optionally update UI with new guest details
        } catch (e: any) {
            setSaveError(e.message || 'Failed to save');
        } finally {
            setSaving(null);
        }
    };

    const sendTickets = async (initialEmail?: string | null): Promise<void> => {
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
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ booking_code: order.booking_code, email }),
            });
            if (!res.ok) throw new Error(await res.text());
            alert('Tickets emailed successfully');
        } catch (e) {
            alert('Failed to send ticket to email');
        }
    };

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

            <div className="p-4 text-sm">
                <h1 className="text-xl font-semibold">Booking code: {order.booking_code ?? '—'}</h1>
                <div className="mt-2 text-sm text-muted">Placed on: {order.created_at ? new Date(order.created_at).toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}</div>
                {orderEmail && (
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
                        <span>Confirmation sent to:</span>
                        <strong className="text-sm font-semibold text-black dark:text-white">{orderEmail}</strong>
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={() => sendTickets(orderEmail)}
                        >
                            Resend tickets
                        </button>
                    </div>
                )}

                {/* per-item QR moved into each ticket row */}
                <div className="mt-4">
                    {/* Download all tickets when there are multiple tickets */}
                    {totalTickets > 1 && (
                        <div className="mt-2">
                            <a
                                href={downloadAllUrl}
                                className="btn-primary"
                            >
                                Download all tickets
                            </a>
                        </div>
                    )}
                    <div className="mt-2 space-y-2">
                        {items.map((it: any, itemIdx: number) => {
                            const payload = JSON.stringify({
                                booking_code: order.booking_code,
                                customer_name: order.contact_name ?? order.user?.name ?? null,
                                customer_email: order.contact_email ?? order.user?.email ?? null,
                                event: it.event?.title ?? null,
                                start_at: it.event?.start_at ? new Date(it.event.start_at).toLocaleDateString() : null,
                                ticket_type: it.ticket?.name ?? null,
                            });
                            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(payload)}`;
                            const guests = Array.isArray(guestDetails[itemIdx]) ? guestDetails[itemIdx] : [];
                            const defaultEmail = guests.length > 0 ? guests[0]?.email ?? null : null;

                            return (
                                <div key={it.id} className="border p-3 rounded">
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
                                                <div className="text-sm text-muted">{it.ticket?.name ? `Ticket type: ${it.ticket.name}` : 'Ticket type'}</div>
                                                {guests.length > 0 && (
                                                    <div className="space-y-2 mt-2">
                                                        {guests.map((g: any, guestIdx: number) => (
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
                                                        className="btn-primary"
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
                                                className="btn-primary"
                                            >
                                                {it.quantity && it.quantity > 1 ? 'Download tickets' : 'Download ticket'}
                                            </a>
                                            <div className="flex flex-col items-center min-[700px]:items-end gap-2">
                                                <img src={qrUrl} alt="QR" className="w-28 h-28 min-[700px]:w-32 min-[700px]:h-32" />
                                                <div className="text-lg font-semibold">€{Number(it.price).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <div className="text-lg font-medium">Total: €{Number(order.total ?? 0).toFixed(2)}</div>
                </div>
            </div>
        </AppLayout>
    );
}

/* SendTicketButton removed (send ticket functionality removed from this page) */

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

    if (!order) {
        return (
            <AppLayout>
                <Head title="Order" />
                <div className="p-4">
                    <div className="rounded-md bg-red-600 p-3 text-white">
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
                <div className="p-4">
                    <div className="rounded-md bg-green-600 p-3 text-white">
                        <div className="font-semibold">Thank you for your order.</div>
                        <div className="text-sm opacity-90">{page.props.flash.success}</div>
                    </div>
                </div>
            )}

            <div className="p-4">
                <h1 className="text-xl font-semibold">Booking code: {order.booking_code ?? '—'}</h1>
                <div className="mt-2 text-sm text-muted">Placed on: {order.created_at ? new Date(order.created_at).toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}</div>
                { (order.contact_email || order.user?.email) && (
                    <div className="mt-2 text-sm text-muted">Confirmation sent to: <strong>{order.contact_email ?? order.user?.email}</strong></div>
                ) }
                <div className="mt-4">
                    <div className="font-medium">Ticket types</div>
                    {totalTickets > 1 && (
                        <div className="mt-2">
                            <a
                                href={downloadAllUrl}
                                className="inline-flex items-center rounded bg-blue-600 px-3 py-2 text-sm text-white"
                            >
                                Download all tickets
                            </a>
                        </div>
                    )}
                    <div className="mt-2 space-y-2">
                        {items.map((it: any) => (
                            <div key={it.id} className="border p-3 rounded space-y-3">
                                <div className="flex justify-end">
                                    <a
                                        href={`/orders/${order.id}/tickets/${it.id}/download${downloadParams}`}
                                        className="inline-flex items-center rounded bg-blue-600 px-3 py-2 text-xs text-white"
                                    >
                                        {it.quantity && it.quantity > 1 ? 'Download tickets' : 'Download ticket'}
                                    </a>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    {(it.event?.image_thumbnail_url || it.event?.image_url) && (
                                        <img src={it.event?.image_thumbnail_url ?? it.event?.image_url} alt={it.event?.title} className="rounded" />
                                    )}
                                    <div className="flex-1 text-right">
                                        <div className="font-medium">{it.event?.title ?? it.ticket?.name ?? 'Item'}</div>
                                        <div className="text-sm text-muted">{it.ticket?.name ? `Ticket type: ${it.ticket.name}` : 'Ticket type'}</div>
                                        {Array.isArray(it.guest_details) && it.guest_details.length > 0 && (
                                            <div className="text-sm text-muted">Name(s): {it.guest_details.map((g: any) => g?.name).filter(Boolean).join(', ')}</div>
                                        )}
                                        {Array.isArray(it.guest_details) && it.guest_details.length > 0 && (
                                            <div className="text-sm text-muted">Email(s): {it.guest_details.map((g: any) => g?.email).filter(Boolean).join(', ')}</div>
                                        )}
                                        <div className="text-sm text-muted">Qty: {it.quantity}</div>
                                        <div className="mt-2 text-right">€{Number(it.price).toFixed(2)}</div>
                                        <div className="mt-2">
                                            {(() => {
                                                const payload = JSON.stringify({
                                                    booking_code: order.booking_code,
                                                    customer_name: order.contact_name ?? order.user?.name ?? null,
                                                    customer_email: order.contact_email ?? order.user?.email ?? null,
                                                    event: it.event?.title ?? null,
                                                    start_at: it.event?.start_at ? new Date(it.event.start_at).toLocaleDateString() : null,
                                                    ticket_type: it.ticket?.name ?? null,
                                                });
                                                const url = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(payload)}`;
                                                return <img src={url} alt="QR" className="ml-auto w-24 h-24" />;
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-medium">Total: €{Number(order.total ?? 0).toFixed(2)}</div>
                </div>

                <div className="mt-4">
                    <SendTicketButton order={order} />
                </div>
            </div>
        </AppLayout>
    );
}

function SendTicketButton({ order }: { order: any }) {
    const [sending, setSending] = useState(false);
    return (
        <button
            type="button"
            disabled={sending}
            onClick={async () => {
                const email = order.contact_email ?? order.user?.email ?? window.prompt('Email to send tickets to');
                if (!email) return alert('Email is required');
                try {
                    setSending(true);
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
                    alert('Ticket emailed successfully');
                } catch (e) {
                    console.error(e);
                    alert('Failed to send ticket to email');
                } finally {
                    setSending(false);
                }
            }}
            className={`ml-2 inline-flex items-center gap-2 rounded px-3 py-2 text-sm text-white ${sending ? 'bg-gray-500' : 'bg-green-600'}`}
        >
            {sending ? 'In progress...' : 'Send ticket to email'}
        </button>
    );
}

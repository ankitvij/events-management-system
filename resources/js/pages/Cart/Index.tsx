import { Head, Link, usePage } from '@inertiajs/react';
import { Trash } from 'lucide-react';
import React from 'react';
import AppLayout from '@/layouts/app-layout';

function getCsrf() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

export default function CartIndex() {
    const page = usePage();
    const cart = page.props?.cart;
    const initialItems = cart?.items ?? [];
    const initialTotal = page.props?.cart_total ?? 0;
    const initialCount = page.props?.cart_count ?? (initialItems.reduce((s: number, it: any) => s + (it.quantity || 0), 0));

    const [summary, setSummary] = React.useState<{ items: any[]; total: number; count: number }>({ items: groupItems(initialItems), total: initialTotal, count: initialCount });

    async function refreshSummary() {
        try {
            const resp = await fetch('/cart/summary', { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
            if (!resp.ok) return;
            const json = await resp.json();
            setSummary({ items: groupItems(json.items ?? []), total: json.total ?? 0, count: json.count ?? 0 });
        } catch (_error) {
            // ignore
        }
    }

    async function updateItemLocal(itemId: number, quantity: number) {
        try {
            const token = getCsrf();
            const resp = await fetch(`/cart/items/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': token },
                credentials: 'same-origin',
                body: JSON.stringify({ quantity }),
            });
            if (resp.ok) {
                window.dispatchEvent(new CustomEvent('cart:updated'));
                await refreshSummary();
            }
        } catch (_error) {
            // ignore
        }
    }

    async function removeItemLocal(itemId: number) {
        try {
            const token = getCsrf();
            const resp = await fetch(`/cart/items/${itemId}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': token },
                credentials: 'same-origin',
            });
            if (resp.ok) {
                window.dispatchEvent(new CustomEvent('cart:updated'));
                await refreshSummary();
            }
        } catch (_error) {
            // ignore
        }
    }


    return (
        <AppLayout>
            <Head title="Your Cart" />

            <div className="px-4 pt-4 pb-6 space-y-4">
                <div className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-xl font-semibold">Shopping Cart</h1>
                    <div className="text-sm text-muted">Items in cart: {summary.count}</div>
                    <div className="text-sm text-muted">Current total: €{Number(summary.total).toFixed(2)}</div>
                </div>
                {summary.items && summary.items.length > 0 ? (
                    <div className="space-y-3">
                        {summary.items.map((i: any) => (
                            <div
                                key={i.id ?? `${i.ticket_id}_${i.event_id}` }
                                className="box flex items-center justify-between cursor-auto hover:bg-[#eef2f7] hover:shadow-[0_14px_32px_rgba(7,8,10,0.18)]"
                            >
                                <div className="flex items-center gap-3">
                                    {(i.event?.image_thumbnail_url || i.event?.image_url || i.event?.image_thumbnail || i.event?.image) && (
                                        <img
                                            src={i.event?.image_url ?? i.event?.image_thumbnail_url ?? (i.event?.image_thumbnail ? `/storage/${i.event.image_thumbnail}` : (i.event?.image ? `/storage/${i.event.image}` : ''))}
                                            alt={i.event?.title}
                                            className="w-20 h-12 object-cover rounded"
                                        />
                                    )}
                                    <div>
                                        <div className="font-medium">{i.ticket ? i.ticket.name : (i.ticket_id ? `Ticket type #${i.ticket_id}` : 'Item')}</div>
                                        <div className="text-sm text-muted">{i.event ? `Event: ${i.event.title}` : ''}</div>
                                        <div className="text-sm text-muted">Qty: {i.quantity}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">€{Number(i.price).toFixed(2)}</div>
                                    <div className="mt-2 flex items-center justify-end gap-2">
                                        <button type="button" className="btn-ghost border border-border px-2 py-1 text-sm" onClick={() => updateItemLocal(i.id, Math.max(1, i.quantity - 1))}>-</button>
                                        <div className="px-2">{i.quantity}</div>
                                        <button type="button" className="btn-ghost border border-border px-2 py-1 text-sm" onClick={() => updateItemLocal(i.id, i.quantity + 1)}>+</button>
                                        <button
                                            type="button"
                                            aria-label="Delete item"
                                            className="btn-danger ml-3"
                                            onClick={() => removeItemLocal(i.id)}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-muted">Your cart is empty.</div>
                )}

                <div className="text-right px-4 py-3">
                    <div className="text-lg font-medium">Total: €{Number(summary.total).toFixed(2)}</div>
                    <div className="mt-2">
                        <Link href="/cart/checkout" className="btn-confirm">Checkout</Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function groupItems(items: any[]) {
    const map = new Map<string, any>();
    for (const it of items) {
        const key = `${it.ticket_id ?? 't'}:${it.event_id ?? 'e'}`;
        if (!map.has(key)) map.set(key, { ...it });
        else {
            const ex = map.get(key);
            ex.quantity = (ex.quantity || 0) + (it.quantity || 0);
            ex.price = it.price ?? ex.price;
        }
    }
    return Array.from(map.values());
}

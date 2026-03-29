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

            <div className="space-y-4 px-4 pb-6 pt-4">
                <div className="rounded-2xl border border-[#d8dbe1] bg-[#f3f4f6] p-4">
                    <h1 className="text-xl font-semibold leading-none text-[#2a2f38]">Shopping cart</h1>
                    <div className="mt-2 text-sm text-[#9aa1af]">{summary.count} items · €{Number(summary.total).toFixed(2)}</div>
                </div>

                {summary.items && summary.items.length > 0 ? (
                    <div className="space-y-3">
                        {summary.items.map((i: any) => (
                            <div
                                key={i.id ?? `${i.ticket_id}_${i.event_id}` }
                                className="overflow-hidden rounded-2xl border border-[#d8dbe1] bg-[#f3f4f6]"
                            >
                                <div className="flex items-start gap-3 p-4">
                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#234578]">
                                        {(i.event?.image_thumbnail_url || i.event?.image_url || i.event?.image_thumbnail || i.event?.image) && (
                                            <img
                                                src={i.event?.image_url ?? i.event?.image_thumbnail_url ?? (i.event?.image_thumbnail ? `/storage/${i.event.image_thumbnail}` : (i.event?.image ? `/storage/${i.event.image}` : ''))}
                                                alt={i.event?.title}
                                                className="h-full w-full object-cover"
                                            />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="line-clamp-2 text-base font-medium leading-tight text-[#2a2f38]">{i.ticket ? i.ticket.name : (i.ticket_id ? `Ticket type #${i.ticket_id}` : 'Item')}</div>
                                        <div className="mt-1 truncate text-xs text-[#9aa1af]">{i.event ? i.event.title : ''}</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-[#dde0e6] px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#ebedf1] text-sm font-semibold leading-none text-[#4b5260]"
                                            onClick={() => updateItemLocal(i.id, Math.max(1, i.quantity - 1))}
                                        >
                                            −
                                        </button>
                                        <div className="w-6 text-center text-sm text-[#2a2f38]">{i.quantity}</div>
                                        <button
                                            type="button"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#ebedf1] text-sm font-semibold leading-none text-[#4b5260]"
                                            onClick={() => updateItemLocal(i.id, i.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-base font-semibold leading-none text-[#2a2f38]">€{Number(i.price).toFixed(0)}</div>
                                        <button
                                            type="button"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-[#e8b8b8]"
                                            onClick={() => removeItemLocal(i.id)}
                                            aria-label="Delete item"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-[#d8dbe1] bg-white p-4 text-sm text-[#9aa1af]">Your cart is empty.</div>
                )}

                <div className="rounded-2xl border border-[#d8dbe1] bg-[#f3f4f6] p-4">
                    <div className="space-y-1 text-sm text-[#9aa1af]">
                        <div className="flex items-center justify-between">
                            <span>Items</span>
                            <span>{summary.count}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[#dde0e6] pb-2">
                            <span>Subtotal</span>
                            <span>€{Number(summary.total).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-lg font-semibold text-[#2a2f38]">Total</span>
                        <span className="text-lg font-semibold text-[#2a2f38]">€{Number(summary.total).toFixed(2)}</span>
                    </div>
                </div>

                <div>
                    <div className="mt-2">
                        <Link href="/cart/checkout" className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#f97316] text-sm font-semibold text-white">Checkout →</Link>
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

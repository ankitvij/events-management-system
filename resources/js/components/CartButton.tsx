import { Link } from '@inertiajs/react';
import { ShoppingCart, Trash } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export default function CartButton() {
    const [summary, setSummary] = useState<{ count: number; total: number; items?: any[] }>({ count: 0, total: 0, items: [] });
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    const fetchSummary = async () => {
        try {
            const resp = await fetch('/cart/summary', { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
            if (!resp.ok) return;
            const json = await resp.json();
            const items = groupItems(json.items ?? []);
            setSummary({ count: json.count ?? 0, total: json.total ?? 0, items });
        } catch (_error) {
            // ignore
        }
    };

    const getCsrf = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const updateItem = async (itemId: number, quantity: number) => {
        try {
            const token = getCsrf();
            const resp = await fetch(`/cart/items/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': token },
                credentials: 'same-origin',
                body: JSON.stringify({ quantity }),
            });
            if (resp.ok) {
                // refresh summary in-place
                await fetchSummary();
                window.dispatchEvent(new CustomEvent('cart:updated'));
            }
        } catch (_error) {
            // ignore
        }
    };

    const removeItem = async (itemId: number) => {
        try {
            const token = getCsrf();
            const resp = await fetch(`/cart/items/${itemId}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': token },
                credentials: 'same-origin',
            });
            if (resp.ok) {
                await fetchSummary();
                window.dispatchEvent(new CustomEvent('cart:updated'));
            }
        } catch (_error) {
            // ignore
        }
    };

    // Group identical ticket+event items into single display rows
    function groupItems(items: any[]) {
        const map = new Map<string, any>();
        for (const it of items) {
            const key = `${it.ticket_id ?? 't'}:${it.event_id ?? 'e'}`;
            if (!map.has(key)) {
                map.set(key, { ...it });
            } else {
                const ex = map.get(key);
                ex.quantity = (ex.quantity || 0) + (it.quantity || 0);
                ex.price = it.price ?? ex.price;
            }
        }
        return Array.from(map.values());
    }

    useEffect(() => {
        fetchSummary();
        const handler = () => fetchSummary();
        window.addEventListener('cart:updated', handler);
        const onDoc = (e: MouseEvent) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('click', onDoc);
        return () => {
            window.removeEventListener('cart:updated', handler);
            document.removeEventListener('click', onDoc);
        };
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                title={`${summary.count} items — €${Number(summary.total).toFixed(2)}`}
                onClick={() => setOpen((v) => !v)}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#f97316] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#ea580c] min-[1000px]:bg-[#18181b] min-[1000px]:hover:bg-[#09090b]"
            >
                <ShoppingCart className="mr-1.5 h-4 w-4" aria-hidden="true" />
                <span>€{Number(summary.total).toFixed(2)}</span>

                {summary.count > 0 && (
                    <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f97316] px-1.5 text-[11px] text-white">{summary.count}</span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-[21rem] max-w-[92vw] overflow-hidden rounded-b-2xl rounded-t-none border border-[#d7dbe2] bg-[#f3f4f6] shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center justify-between border-b border-[#d6d9df] px-4 py-3">
                        <div className="text-base font-medium text-[#232733]">Your cart</div>
                        <div className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#1b1d22] px-2 text-xs font-semibold text-white">
                            {summary.count} {summary.count === 1 ? 'item' : 'items'}
                        </div>
                    </div>

                    <div className="max-h-[19rem] overflow-auto px-2 py-2">
                        {summary.items && summary.items.length > 0 ? (
                            summary.items.slice(0, 6).map((it: any) => (
                                <div key={it.id} className="mb-2 rounded-xl border border-[#dde0e6] bg-white p-3 last:mb-0">
                                    <div className="flex items-start gap-3">
                                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-[#234578]">
                                            {it.event?.image_thumbnail || it.event?.image ? (
                                                <img
                                                    src={it.event?.image_thumbnail ? `/storage/${it.event.image_thumbnail}` : `/storage/${it.event.image}`}
                                                    alt={(it.event && it.event.title) || 'Event'}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : null}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 text-sm leading-tight">
                                                    <div className="line-clamp-2 text-base font-medium text-[#2a2f38]">{(it.ticket && it.ticket.name) || `Item ${it.id}`}</div>
                                                    <div className="mt-1 truncate text-xs text-[#98a0ae]">{(it.event && it.event.title) || ''}</div>
                                                </div>
                                                <div className="text-base font-semibold leading-tight text-[#232733]">€{Number(it.price).toFixed(0)}</div>
                                            </div>

                                            <div className="mt-2 flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#f1f2f5] text-sm font-semibold text-[#4b5260]"
                                                    onClick={() => updateItem(it.id, Math.max(1, it.quantity - 1))}
                                                >
                                                    −
                                                </button>
                                                <div className="text-sm text-[#2a2f38]">{it.quantity}</div>
                                                <button
                                                    type="button"
                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#f1f2f5] text-sm font-semibold text-[#4b5260]"
                                                    onClick={() => updateItem(it.id, it.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                                <button
                                                    type="button"
                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-transparent text-[#e5b4b4] transition-colors hover:bg-transparent hover:text-[#d17979]"
                                                    onClick={() => removeItem(it.id)}
                                                    aria-label="Delete item"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-[#d3d6de] bg-white p-4 text-sm text-[#7b8391]">Cart is empty</div>
                        )}
                    </div>

                    <div className="border-t border-[#d6d9df] bg-white px-4 py-3">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="text-lg text-[#99a1af]">Total</div>
                            <div className="text-lg font-semibold leading-none text-[#232733]">€{Number(summary.total).toFixed(2)}</div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link href="/cart" className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-[#2e3440] text-[1.05rem] font-medium text-[#2a2f38]" onClick={() => setOpen(false)}>View cart</Link>
                            {summary.count > 0 && (
                                <Link href="/cart/checkout" className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#f97316] text-[1.05rem] font-medium text-white" onClick={() => setOpen(false)}>Checkout →</Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import { Link } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { Trash } from 'lucide-react';

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
        } catch (e) {
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
        } catch (e) {
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
        } catch (e) {
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
                aria-expanded={open}
                title={`${summary.count} items — €${Number(summary.total).toFixed(2)}`}
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
                    <circle cx="10" cy="20" r="1" />
                    <circle cx="18" cy="20" r="1" />
                </svg>
                <span className="font-medium">{summary.count}</span>
                <span className="text-xs text-muted">€{Number(summary.total).toFixed(2)}</span>

                {summary.count > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-red-600 text-white text-xs">{summary.count}</span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg p-3 z-50">
                    <div className="text-sm font-medium">Cart</div>
                    <div className="mt-2 max-h-56 overflow-auto">
                        {summary.items && summary.items.length > 0 ? (
                            summary.items.slice(0, 6).map((it: any) => (
                                <div key={it.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                    <div className="text-sm">
                                        <div className="font-medium">{(it.ticket && it.ticket.name) || `Item ${it.id}`}</div>
                                        <div className="text-xs text-muted">{(it.event && it.event.title) ? `Event: ${it.event.title}` : ''}</div>
                                        <div className="text-xs text-muted">€{Number(it.price).toFixed(2)} · Line: €{Number(it.quantity * it.price).toFixed(2)}</div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center">
                                            <button type="button" className="btn-ghost border border-border px-2 py-1 text-sm" onClick={() => updateItem(it.id, Math.max(1, it.quantity - 1))}>-</button>
                                            <div className="px-3 text-sm">{it.quantity}</div>
                                            <button type="button" className="btn-ghost border border-border px-2 py-1 text-sm" onClick={() => updateItem(it.id, it.quantity + 1))}>+</button>
                                        </div>
                                        <button type="button" aria-label="Delete item" className="btn-ghost text-red-600 mt-2 p-1" onClick={() => removeItem(it.id)}>
                                            <Trash className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted">Cart is empty</div>
                        )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm text-muted">Total: €{Number(summary.total).toFixed(2)}</div>
                        <div className="flex items-center gap-2">
                            <Link href="/cart" className="text-sm text-blue-600">View cart</Link>
                            {summary.count > 0 && (
                                <Link href="/cart/checkout" className="btn-primary" onClick={() => setOpen(false)}>Checkout</Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

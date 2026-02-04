import { Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { Trash } from 'lucide-react';

export default function CartSidebar({ cart }: { cart?: any }) {
    const [summary, setSummary] = useState<{ count: number; total: number; items?: any[] }>({ count: cart?.items?.length ?? 0, total: 0, items: cart?.items ?? [] });

    const fetchSummary = async () => {
        try {
            const resp = await fetch('/cart/summary', { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
            if (!resp.ok) return;
            const json = await resp.json();
            const items = groupItems(json.items ?? []);
            setSummary({ count: json.count ?? 0, total: json.total ?? 0, items });
        } catch (e) {
            // silent
        }
    };

    useEffect(() => {
        fetchSummary();
        const handler = () => fetchSummary();
        window.addEventListener('cart:updated', handler);
        return () => window.removeEventListener('cart:updated', handler);
    }, []);

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
            if (resp.ok) window.dispatchEvent(new CustomEvent('cart:updated'));
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
            if (resp.ok) window.dispatchEvent(new CustomEvent('cart:updated'));
        } catch (e) {
            // ignore
        }
    };

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

    return (
        <div className="p-4 border rounded">
            <h3 className="font-semibold">Cart</h3>
            <div className="text-sm text-muted">Items: {summary.count}</div>
            <div className="text-sm text-muted">Total: €{Number(summary.total).toFixed(2)}</div>

            <div className="mt-2 space-y-2 max-h-48 overflow-auto">
                {summary.items && summary.items.length > 0 ? (
                    summary.items.map((it: any) => (
                        <div key={it.id} className="flex items-center justify-between">
                            <div className="text-sm">
                                <div className="font-medium">{(it.ticket && it.ticket.name) || `Item ${it.id}`}</div>
                                <div className="text-xs text-muted">{(it.event && it.event.title) ? `Event: ${it.event.title}` : ''}</div>
                                <div className="text-xs text-muted">€{Number(it.price).toFixed(2)}</div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center">
                                    <button type="button" className="px-2 py-1 border rounded text-sm" onClick={() => updateItem(it.id, Math.max(1, it.quantity - 1))}>-</button>
                                    <div className="px-3 text-sm">{it.quantity}</div>
                                    <button type="button" className="px-2 py-1 border rounded text-sm" onClick={() => updateItem(it.id, it.quantity + 1)}>+</button>
                                </div>
                                <button type="button" aria-label="Delete item" className="text-red-600 mt-1 p-1 rounded hover:bg-red-50" onClick={() => removeItem(it.id)}>
                                    <Trash className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : null}
            </div>

            <div className="mt-2">
                <Link href="/cart" className="text-blue-600">View cart</Link>
            </div>
        </div>
    );
}

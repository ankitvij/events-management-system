import { Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

export default function CartSidebar({ cart }: { cart?: any }) {
    const [summary, setSummary] = useState<{ count: number; total: number }>({ count: cart?.items?.length ?? 0, total: 0 });

    const fetchSummary = async () => {
        try {
            const resp = await fetch('/cart/summary', { headers: { Accept: 'application/json' } });
            if (!resp.ok) return;
            const json = await resp.json();
            setSummary({ count: json.count ?? 0, total: json.total ?? 0 });
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

    return (
        <div className="p-4 border rounded">
            <h3 className="font-semibold">Cart</h3>
            <div className="text-sm text-muted">Items: {summary.count}</div>
            <div className="text-sm text-muted">Total: ${Number(summary.total).toFixed(2)}</div>
            <div className="mt-2">
                <Link href="/cart" className="text-blue-600">View cart</Link>
            </div>
        </div>
    );
}

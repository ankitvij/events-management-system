import { Head, Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';

function getCsrf() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

export default function CartCheckout() {
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<{ count: number; total: number }>({ count: 0, total: 0 });

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const resp = await fetch('/cart/summary', { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
                if (!resp.ok) return;
                const j = await resp.json();
                if (!mounted) return;
                setSummary({ count: j.count ?? 0, total: j.total ?? 0 });
            } catch (e) {
                // ignore
            }
        })();
        return () => { mounted = false; };
    }, []);

    async function handleConfirm() {
        setLoading(true);
        try {
            const token = getCsrf();
            const resp = await fetch('/cart/checkout', {
                method: 'POST',
                headers: { Accept: 'application/json', 'X-CSRF-TOKEN': token },
                credentials: 'same-origin',
            });
            if (!resp.ok) {
                const j = await resp.json().catch(() => ({ message: 'Checkout failed' }));
                window.dispatchEvent(new CustomEvent('app:toast', { detail: { type: 'error', message: j.message || 'Checkout failed' } }));
                setLoading(false);
                return;
            }
            const j = await resp.json();
            if (j.success) {
                window.dispatchEvent(new CustomEvent('app:toast', { detail: { type: 'success', message: j.message || 'Checkout complete' } }));
                window.dispatchEvent(new CustomEvent('cart:updated'));
                window.location.href = '/cart';
            } else {
                window.dispatchEvent(new CustomEvent('app:toast', { detail: { type: 'error', message: j.message || 'Checkout failed' } }));
            }
        } catch (e) {
            window.dispatchEvent(new CustomEvent('app:toast', { detail: { type: 'error', message: 'Checkout error' } }));
        } finally {
            setLoading(false);
        }
    }

    return (
        <AppLayout>
            <Head>
                <title>Checkout</title>
            </Head>

            <div className="p-4">
                <h1 className="text-xl font-semibold">Checkout</h1>
                <p className="mt-2 text-sm text-muted">
                    This will attempt to reserve your selected tickets. Reservations are temporary.
                </p>

                <div className="mt-4 rounded border p-4">
                    <div className="text-sm">Items: {summary.count}</div>
                    <div className="text-lg font-medium">Total: €{Number(summary.total).toFixed(2)}</div>
                </div>

                <div className="mt-6 flex items-center gap-2">
                    <Link href="/cart" className="px-3 py-2 rounded border">Back to cart</Link>
                    <button
                        type="button"
                        className="px-3 py-2 rounded bg-green-600 text-white"
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Processing…' : 'Confirm Checkout'}
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}

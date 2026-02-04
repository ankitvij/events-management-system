import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog';

function getCsrf() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

export default function CheckoutModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess?: () => void }) {
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<{ count: number; total: number }>({ count: 0, total: 0 });
    const page = usePage();
    const user = page.props?.auth?.user ?? null;
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');

    useEffect(() => {
        if (!isOpen) return;
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
    }, [isOpen]);

    async function handleConfirm() {
        setLoading(true);
        try {
            const token = getCsrf();
            const body: any = {};
            if (!user) {
                body.email = guestEmail;
                body.name = guestName;
            }
            const resp = await fetch('/cart/checkout', {
                method: 'POST',
                headers: { Accept: 'application/json', 'X-CSRF-TOKEN': token, 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(body),
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
                if (onSuccess) onSuccess();
                onClose();
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
        <Dialog open={isOpen} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Checkout</DialogTitle>
                    <DialogDescription>
                        This will attempt to reserve your selected tickets. Reservations are temporary.
                    </DialogDescription>
                </DialogHeader>

                {!user && (
                    <div className="mt-4 space-y-3">
                        <div>
                            <label className="block text-sm font-medium">Full name</label>
                            <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Email address</label>
                            <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
                        </div>
                    </div>
                )}

                <div className="mt-4">
                    <div className="text-sm">Items: {summary.count}</div>
                    <div className="text-lg font-medium">Total: €{Number(summary.total).toFixed(2)}</div>
                </div>

                <DialogFooter className="mt-6 flex items-center justify-end gap-2">
                    <DialogClose asChild>
                        <button type="button" className="px-3 py-2 rounded border" disabled={loading}>Cancel</button>
                    </DialogClose>
                    <button type="button" className="px-3 py-2 rounded bg-green-600 text-white" onClick={handleConfirm} disabled={loading}>{loading ? 'Processing…' : 'Confirm Checkout'}</button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

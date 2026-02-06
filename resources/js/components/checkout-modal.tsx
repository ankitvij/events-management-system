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
    const [items, setItems] = useState<any[]>([]);
    const page = usePage();
    const user = page.props?.auth?.user ?? null;
    const [guestEmail, setGuestEmail] = useState('');
    const [createAccount, setCreateAccount] = useState(false);
    const [password, setPassword] = useState('');
    const [accountCreated, setAccountCreated] = useState(false);
    const [guestDetails, setGuestDetails] = useState<Record<number, { name: string }[]>>({});

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
                const nextItems = Array.isArray(j.items) ? j.items : [];
                setItems(nextItems);
                setGuestDetails((prev) => {
                    const next: Record<number, { name: string }[]> = { ...prev };
                    nextItems.forEach((item: any) => {
                        const qty = Math.max(1, Number(item.quantity || 1));
                        const existing = next[item.id] || [];
                        if (existing.length !== qty) {
                            next[item.id] = Array.from({ length: qty }, (_, idx) => existing[idx] || { name: '' });
                        }
                    });
                    return next;
                });
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
                if (createAccount && password) body.password = password;
            }
            body.ticket_guests = items.map((item: any) => ({
                cart_item_id: item.id,
                guests: guestDetails[item.id] || [],
            }));
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
                if (j.customer_created) {
                    // show a short confirmation inside modal before redirecting
                    setAccountCreated(true);
                    setTimeout(() => {
                        // navigate to order page after short pause
                        window.location.href = `/orders/${j.order_id}?booking_code=${encodeURIComponent(j.booking_code)}`;
                    }, 1200);
                } else {
                    // navigate immediately to the order page
                    window.location.href = `/orders/${j.order_id}?booking_code=${encodeURIComponent(j.booking_code)}`;
                }
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
                            <label className="block text-sm font-medium">Email address <span className="text-red-600">*</span></label>
                            <input required type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
                        </div>
                            <div className="flex items-center">
                                <input id="createAccount" type="checkbox" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} />
                                <label htmlFor="createAccount" className="ml-2 text-sm">Create an account for future access</label>
                            </div>
                            {createAccount && (
                                <div>
                                    <label className="block text-sm font-medium">Password</label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
                                </div>
                            )}
                    </div>
                )}

                {items.length > 0 && (
                    <div className="mt-4 space-y-4">
                        <div className="text-sm font-medium">Ticket holder details</div>
                        {items.map((item: any) => (
                            <div key={item.id} className="rounded border p-3">
                                <div className="text-sm font-medium">{item.event?.title ?? item.ticket?.name ?? 'Ticket type'}</div>
                                <div className="text-xs text-muted">Ticket type: {item.ticket?.name ?? '—'}</div>
                                <div className="text-xs text-muted">Qty: {item.quantity}</div>
                                <div className="mt-2 space-y-2">
                                    {(guestDetails[item.id] || []).map((guest, idx) => (
                                        <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            <input
                                                type="text"
                                                value={guest.name}
                                                required
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setGuestDetails((prev) => ({
                                                        ...prev,
                                                        [item.id]: (prev[item.id] || []).map((g, i) => i === idx ? { ...g, name: value } : g),
                                                    }));
                                                }}
                                                className="mt-1 block w-full border rounded px-2 py-1"
                                                placeholder="Ticket holder name"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-4">
                    <div className="text-sm">Items: {summary.count}</div>
                    <div className="text-lg font-medium">Total: €{Number(summary.total).toFixed(2)}</div>
                </div>

                {accountCreated && (
                    <div className="mt-3 p-2 rounded bg-green-100 text-green-800 text-sm">Account created — you are now logged in as the customer.</div>
                )}

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

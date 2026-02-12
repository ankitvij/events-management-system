import { Head, Link, usePage } from '@inertiajs/react';
import { Trash } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';

function getCsrf() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

type GuestEntry = { name: string; email: string };
type TicketGuestsEntry = { cart_item_id: number; guests: GuestEntry[] };

export default function CartCheckout() {
    const page = usePage();
    const cart = (page.props as any)?.cart;
    const paymentMethods = (page.props as any)?.payment_methods || {};
    const initialItems = cart?.items ?? [];
    const [items, setItems] = useState<any[]>(initialItems);
    const [loading, setLoading] = useState(false);
    const availableMethod = useMemo(() => {
        const entries = Object.entries(paymentMethods).filter(([, details]: any) => details && details.enabled !== false);
        return (entries[0]?.[0] as string) || 'bank_transfer';
    }, [paymentMethods]);
    const [paymentMethod, setPaymentMethod] = useState<string>(availableMethod);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [ticketGuests, setTicketGuests] = useState<TicketGuestsEntry[]>(() => (
        initialItems.map((item: any) => ({
            cart_item_id: item.id,
            guests: Array.from({ length: Math.max(0, Number(item.quantity ?? 0)) }, () => ({ name: '', email: '' })),
        }))
    ));

    const totals = useMemo(() => {
        const count = items.reduce((sum: number, item: any) => sum + Number(item.quantity ?? 0), 0);
        const computedTotal = items.reduce((sum: number, item: any) => sum + Number(item.quantity ?? 0) * Number(item.price ?? 0), 0);
        const total = (page.props as any)?.cart_total ?? computedTotal;

        return { count, total };
    }, [items, page.props]);


    async function removeItem(itemId: number) {
        try {
            const token = getCsrf();
            const resp = await fetch(`/cart/items/${itemId}`, {
                method: 'DELETE',
                headers: { Accept: 'application/json', 'X-CSRF-TOKEN': token },
                credentials: 'same-origin',
            });

            if (!resp.ok) {
                throw new Error('Failed to remove item');
            }

            setItems((prev) => prev.filter((item) => item.id !== itemId));
            setTicketGuests((prev) => prev.filter((entry) => entry.cart_item_id !== itemId));
            window.dispatchEvent(new CustomEvent('cart:updated'));
        } catch (_error) {
            window.dispatchEvent(new CustomEvent('app:toast', { detail: { type: 'error', message: 'Could not remove item.' } }));
        }
    }

    function updateGuestField(cartItemId: number, index: number, field: keyof GuestEntry, value: string) {
        setTicketGuests((prev) => prev.map((entry) => {
            if (entry.cart_item_id !== cartItemId) return entry;
            return {
                ...entry,
                guests: entry.guests.map((guest, guestIndex) => (
                    guestIndex === index ? { ...guest, [field]: value } : guest
                )),
            };
        }));
    }

    function hasMissingGuestNames() {
        return ticketGuests.some((entry) => entry.guests.some((guest) => !guest.name.trim()));
    }

    async function handleConfirm() {
        if (!email.trim()) {
            window.dispatchEvent(new CustomEvent('app:toast', { detail: { type: 'error', message: 'Please enter your email address.' } }));
            return;
        }

        if (hasMissingGuestNames()) {
            window.dispatchEvent(new CustomEvent('app:toast', { detail: { type: 'error', message: 'Please enter a ticket holder name for each ticket.' } }));
            return;
        }

        setLoading(true);
        try {
            const token = getCsrf();
            const payload = {
                email: email.trim(),
                password: password.trim() || null,
                payment_method: paymentMethod,
                ticket_guests: ticketGuests.map((entry) => ({
                    cart_item_id: entry.cart_item_id,
                    guests: entry.guests.map((guest) => ({
                        name: guest.name.trim(),
                        email: guest.email.trim() || null,
                    })),
                })),
            };
            const resp = await fetch('/cart/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': token },
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });
            if (!resp.ok) {
                const j = await resp.json().catch(() => ({ message: 'Checkout failed' }));
                const firstError = j?.errors ? Object.values(j.errors)[0]?.[0] : null;
                window.dispatchEvent(new CustomEvent('app:toast', { detail: { type: 'error', message: firstError || j.message || 'Checkout failed' } }));
                setLoading(false);
                return;
            }
            const j = await resp.json();
            if (j.success) {
                window.dispatchEvent(new CustomEvent('app:toast', { detail: { type: 'success', message: j.message || 'Checkout complete' } }));
                window.dispatchEvent(new CustomEvent('cart:updated'));
                const bookingCode = j.booking_code ?? '';
                window.location.href = `/orders/${j.order_id}?booking_code=${encodeURIComponent(bookingCode)}`;
            } else {
                window.dispatchEvent(new CustomEvent('app:toast', { detail: { type: 'error', message: j.message || 'Checkout failed' } }));
            }
        } catch (_error) {
            window.dispatchEvent(new CustomEvent('app:toast', { detail: { type: 'error', message: 'Checkout error' } }));
        } finally {
            setLoading(false);
        }
    }

    return (
        <AppLayout>
            <Head title="Checkout" />

            <div className="p-4">
                <h1 className="text-xl font-semibold">Checkout</h1>
                <p className="mt-2 text-sm text-muted">
                    This will attempt to reserve your selected tickets. Reservations are temporary.
                </p>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                    <div className="space-y-6">
                        {items.length === 0 ? (
                            <div className="box cursor-auto text-sm text-muted">Your cart is empty.</div>
                        ) : (
                            items.map((item: any) => {
                                const entry = ticketGuests.find((guestEntry) => guestEntry.cart_item_id === item.id);
                                const eventImage = item.event?.image_thumbnail_url
                                    ?? item.event?.image_url
                                    ?? (item.event?.image_thumbnail ? `/storage/${item.event.image_thumbnail}` : (item.event?.image ? `/storage/${item.event.image}` : null));

                                return (
                                    <div key={item.id} className="box cursor-auto">
                                        <div className="flex items-start justify-between gap-4">
                                            {eventImage && (
                                                <img
                                                    src={eventImage}
                                                    alt={item.event?.title ?? 'Event'}
                                                    className="h-16 w-24 rounded object-cover"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <div className="text-sm text-muted">{item.event?.title ?? 'Event'}</div>
                                                <div className="text-base font-semibold">{item.ticket?.name ?? 'Ticket'}</div>
                                                <div className="text-sm text-muted">Qty: {item.quantity}</div>
                                            </div>
                                            <button
                                                type="button"
                                                aria-label="Delete item"
                                                className="btn-danger ml-3"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="mt-4 space-y-4">
                                            {entry?.guests.map((guest, index) => (
                                                <div key={`${item.id}-${index}`} className="grid gap-3 sm:grid-cols-2">
                                                    <div>
                                                        <label className="block text-sm font-medium">Ticket holder {index + 1} name</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={guest.name}
                                                            onChange={(e) => updateGuestField(item.id, index, 'name', e.target.value)}
                                                            className="mt-1 w-full rounded border px-3 py-2"
                                                            placeholder="Full name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium">Ticket holder {index + 1} email (optional)</label>
                                                        <input
                                                            type="email"
                                                            value={guest.email}
                                                            onChange={(e) => updateGuestField(item.id, index, 'email', e.target.value)}
                                                            className="mt-1 w-full rounded border px-3 py-2"
                                                            placeholder="name@example.com"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="self-start">
                        <div className="box cursor-auto space-y-6">
                            <div>
                                <h2 className="text-base font-semibold">Customer details</h2>
                                <div className="mt-3">
                                    <label className="block text-sm font-medium">Email address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 w-full rounded border px-3 py-2"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div className="mt-3">
                                    <label className="block text-sm font-medium">Password (optional)</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-1 w-full rounded border px-3 py-2"
                                        placeholder="Create a password"
                                    />
                                    <div className="mt-1 text-xs text-muted">Add a password to create or secure your customer account.</div>
                                </div>
                            </div>

                            <div className="border-t border-border pt-4">
                                <div>
                                    <h2 className="text-base font-semibold">Payment method</h2>
                                    <div className="mt-3 space-y-2">
                                        {Object.entries(paymentMethods).map(([method, details]: any) => {
                                            if (!details || details.enabled === false) return null;
                                            const isBankTransfer = method === 'bank_transfer';
                                            const isIdOnlyTransfer = method === 'paypal_transfer' || method === 'revolut_transfer';

                                            return (
                                                <label key={method} className="block text-sm space-y-1">
                                                    <span className="flex items-start gap-2">
                                                        <input
                                                            type="radio"
                                                            name="payment_method"
                                                            value={method}
                                                            checked={paymentMethod === method}
                                                            onChange={() => setPaymentMethod(method)}
                                                        />
                                                        <span>
                                                            <div className="font-semibold">{details.display_name || method}</div>
                                                            <div className="text-muted text-sm">You will receive instructions to complete payment.</div>
                                                        </span>
                                                    </span>
                                                    {paymentMethod === method && (
                                                        <div className="rounded-md border border-border bg-muted/30 p-3 text-sm leading-relaxed">
                                                            {isBankTransfer && (
                                                                <>
                                                                    <div><strong>Account name:</strong> {details.account_name}</div>
                                                                    <div><strong>IBAN:</strong> {details.iban}</div>
                                                                    <div><strong>BIC/SWIFT:</strong> {details.bic}</div>
                                                                </>
                                                            )}
                                                            {isIdOnlyTransfer && (
                                                                <div><strong>Account ID:</strong> {details.account_id}</div>
                                                            )}
                                                            {details.instructions && (
                                                                <div className="mt-2">{details.instructions}</div>
                                                            )}
                                                            {details.reference_hint && (
                                                                <div className="mt-1 text-xs text-muted">{details.reference_hint}</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="text-sm text-muted">Items: {totals.count}</div>
                                <div className="mt-2 text-lg font-semibold">Total: €{Number(totals.total).toFixed(2)}</div>

                                <div className="mt-6 flex items-center gap-2">
                                    <Link href="/cart" className="btn-secondary" onClick={() => window.dispatchEvent(new CustomEvent('cart:updated'))}>Back to cart</Link>
                                    <button
                                        type="button"
                                        className="btn-confirm"
                                        onClick={handleConfirm}
                                        disabled={loading || items.length === 0}
                                    >
                                        {loading ? 'Processing…' : 'Confirm Checkout'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

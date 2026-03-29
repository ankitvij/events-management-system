import { Head, Link, usePage } from '@inertiajs/react';
import { Trash } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import ActionIcon from '@/components/action-icon';
import AppLayout from '@/layouts/app-layout';

function getCsrf() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

type GuestEntry = { name: string; email: string };
type TicketGuestsEntry = { cart_item_id: number; guests: GuestEntry[] };

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removePaymentDeadlineLine(text?: string | null): string {
    if (!text) {
        return '';
    }

    return text
        .replace(/\s*payment needs to be there at least 1 day before the event\.?\s*/gi, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

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
    const [customerName, setCustomerName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [guestFieldErrors, setGuestFieldErrors] = useState<Record<string, string>>({});
    const [sameAsCustomer, setSameAsCustomer] = useState<Record<number, boolean>>({});
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
        if (field === 'name') {
            const guestKey = `${cartItemId}:${index}:name`;
            setGuestFieldErrors((prev) => {
                const next = { ...prev };
                if (value.trim()) {
                    delete next[guestKey];
                }

                return next;
            });
        }
        setFormErrors((prev) => {
            const next = { ...prev };
            delete next.ticket_guests;
            return next;
        });
    }

    function applyCustomerToFirstGuest(cartItemId: number, name: string, customerEmail: string) {
        setTicketGuests((prev) => prev.map((entry) => {
            if (entry.cart_item_id !== cartItemId || entry.guests.length === 0) {
                return entry;
            }

            return {
                ...entry,
                guests: entry.guests.map((guest, guestIndex) => (
                    guestIndex === 0
                        ? { ...guest, name: name.trim(), email: customerEmail.trim() }
                        : guest
                )),
            };
        }));
    }

    async function handleConfirm() {
        const nextErrors: Record<string, string> = {};
        const nextGuestErrors: Record<string, string> = {};
        if (!customerName.trim()) {
            nextErrors.name = 'Please enter your full name.';
        }
        if (!email.trim()) {
            nextErrors.email = 'Please enter your email address.';
        }
        if (!paymentMethod) {
            nextErrors.payment_method = 'Please choose a payment method.';
        }

        ticketGuests.forEach((entry) => {
            entry.guests.forEach((guest, guestIndex) => {
                const isAutoFilledFromCustomer = guestIndex === 0 && sameAsCustomer[entry.cart_item_id] === true;
                if (isAutoFilledFromCustomer) {
                    return;
                }

                if (!guest.name.trim()) {
                    nextGuestErrors[`${entry.cart_item_id}:${guestIndex}:name`] = 'Ticket holder name is required.';
                }
            });
        });

        if (Object.keys(nextGuestErrors).length > 0) {
            nextErrors.ticket_guests = 'Please enter a ticket holder name for each ticket.';
        }

        if (Object.keys(nextErrors).length > 0) {
            setFormErrors(nextErrors);
            setGuestFieldErrors(nextGuestErrors);
            window.dispatchEvent(new CustomEvent('app:toast', { detail: { type: 'error', message: Object.values(nextErrors)[0] } }));
            return;
        }

        setFormErrors({});
        setGuestFieldErrors({});
        setLoading(true);
        try {
            const token = getCsrf();
            const payload = {
                email: email.trim(),
                name: customerName.trim(),
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
                if (j?.errors) {
                    const nextServerErrors: Record<string, string> = {};
                    Object.entries(j.errors).forEach(([key, value]) => {
                        const messages = Array.isArray(value) ? value : [value];
                        nextServerErrors[key] = String(messages[0]);
                    });
                    setFormErrors(nextServerErrors);
                }
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

            <div className="space-y-4 px-4 pb-6 pt-4">
                <h1 className="text-xl font-semibold leading-none text-[#2a2f38]">Checkout</h1>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
                    <div className="space-y-6">
                        <div className="max-w-4xl rounded-2xl border border-[#d8dbe1] bg-[#f3f4f6] p-4">
                        <h2 className="text-base font-semibold text-[#2a2f38]">Customer details</h2>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-[#2a2f38]">Full name</label>
                                <input
                                    type="text"
                                    required
                                    value={customerName}
                                    onChange={(e) => {
                                        const nextName = e.target.value;
                                        setCustomerName(nextName);
                                        setFormErrors((prev) => {
                                            const next = { ...prev };
                                            delete next.name;
                                            return next;
                                        });
                                        Object.entries(sameAsCustomer).forEach(([itemId, checked]) => {
                                            if (checked) {
                                                applyCustomerToFirstGuest(Number(itemId), nextName, email);
                                                if (nextName.trim()) {
                                                    setGuestFieldErrors((prev) => {
                                                        const next = { ...prev };
                                                        delete next[`${itemId}:0:name`];
                                                        return next;
                                                    });
                                                }
                                            }
                                        });
                                    }}
                                    className="mt-1 h-10 w-full rounded-xl border border-[#d8dbe1] bg-white px-3 text-sm text-[#2a2f38]"
                                    placeholder="Your full name"
                                />
                                {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#2a2f38]">Email address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => {
                                        const nextEmail = e.target.value;
                                        setEmail(nextEmail);
                                        setFormErrors((prev) => {
                                            const next = { ...prev };
                                            delete next.email;
                                            return next;
                                        });
                                        Object.entries(sameAsCustomer).forEach(([itemId, checked]) => {
                                            if (checked) {
                                                applyCustomerToFirstGuest(Number(itemId), customerName, nextEmail);
                                            }
                                        });
                                    }}
                                    className="mt-1 h-10 w-full rounded-xl border border-[#d8dbe1] bg-white px-3 text-sm text-[#2a2f38]"
                                    placeholder="you@example.com"
                                />
                                {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-[#2a2f38]">Password (optional)</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 h-10 w-full rounded-xl border border-[#d8dbe1] bg-white px-3 text-sm text-[#2a2f38]"
                                    placeholder="Create a password"
                                />
                                <div className="mt-1 text-xs text-[#9aa1af]">Add a password to create or secure your customer account.</div>
                            </div>
                        </div>
                    </div>

                        {items.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#d8dbe1] bg-white p-4 text-sm text-[#9aa1af]">Your cart is empty.</div>
                        ) : (
                            items.map((item: any) => {
                                const entry = ticketGuests.find((guestEntry) => guestEntry.cart_item_id === item.id);
                                const eventImage = item.event?.image_thumbnail_url
                                    ?? item.event?.image_url
                                    ?? (item.event?.image_thumbnail ? `/storage/${item.event.image_thumbnail}` : (item.event?.image ? `/storage/${item.event.image}` : null));

                                return (
                                    <div key={item.id} className="rounded-2xl border border-[#d8dbe1] bg-[#f3f4f6] p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            {eventImage && (
                                                <img
                                                    src={eventImage}
                                                    alt={item.event?.title ?? 'Event'}
                                                    className="h-16 w-24 rounded-xl object-cover"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <div className="text-xs text-[#9aa1af]">{item.event?.title ?? 'Event'}</div>
                                                <div className="text-base font-medium text-[#2a2f38]">{item.ticket?.name ?? 'Ticket'}</div>
                                                <div className="text-sm text-[#9aa1af]">Qty: {item.quantity}</div>
                                            </div>
                                            <ActionIcon
                                                aria-label="Delete item"
                                                className="ml-3 text-[#e8b8b8]"
                                                onClick={() => removeItem(item.id)}
                                                danger
                                            >
                                                <Trash className="h-4 w-4" />
                                            </ActionIcon>
                                        </div>

                                        <div className="mt-4 space-y-4">
                                            {entry?.guests.map((guest, index) => (
                                                <div key={`${item.id}-${index}`} className="grid gap-3 sm:grid-cols-2">
                                                    {index === 0 && (
                                                        <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-[#2a2f38]">
                                                            <input
                                                                type="checkbox"
                                                                checked={sameAsCustomer[item.id] === true}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    setSameAsCustomer((prev) => ({ ...prev, [item.id]: checked }));
                                                                    if (checked) {
                                                                        applyCustomerToFirstGuest(item.id, customerName, email);
                                                                        if (customerName.trim()) {
                                                                            setGuestFieldErrors((prev) => {
                                                                                const next = { ...prev };
                                                                                delete next[`${item.id}:0:name`];
                                                                                return next;
                                                                            });
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                            <span>{entry.guests.length === 1 ? 'Ticket holder same as customer.' : 'Ticket holder 1 same as customer.'}</span>
                                                        </label>
                                                    )}

                                                    <div>
                                                        <label className="block text-sm font-medium text-[#2a2f38]">{entry.guests.length === 1 ? 'Ticket holder' : `Ticket holder ${index + 1}`} name</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={guest.name}
                                                            onChange={(e) => updateGuestField(item.id, index, 'name', e.target.value)}
                                                            className="mt-1 h-10 w-full rounded-xl border border-[#d8dbe1] bg-white px-3 text-sm text-[#2a2f38]"
                                                            disabled={index === 0 && sameAsCustomer[item.id] === true}
                                                            placeholder="Full name"
                                                        />
                                                        {guestFieldErrors[`${item.id}:${index}:name`] && (
                                                            <p className="mt-1 text-sm text-red-600">{guestFieldErrors[`${item.id}:${index}:name`]}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-[#2a2f38]">{entry.guests.length === 1 ? 'Ticket holder' : `Ticket holder ${index + 1}`} email (optional)</label>
                                                        <input
                                                            type="email"
                                                            value={guest.email}
                                                            onChange={(e) => updateGuestField(item.id, index, 'email', e.target.value)}
                                                            className="mt-1 h-10 w-full rounded-xl border border-[#d8dbe1] bg-white px-3 text-sm text-[#2a2f38]"
                                                            disabled={index === 0 && sameAsCustomer[item.id] === true}
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
                        <div className="space-y-6 rounded-2xl border border-[#d8dbe1] bg-[#f3f4f6] p-4">
                            <div>
                                <div>
                                    <h2 className="text-base font-semibold text-[#2a2f38]">Payment method</h2>
                                    <div className="mt-3 space-y-2">
                                        {Object.entries(paymentMethods).map(([method, details]: any) => {
                                            if (!details || details.enabled === false) return null;
                                            const isBankTransfer = method === 'bank_transfer';
                                            const isIdOnlyTransfer = method === 'paypal_transfer' || method === 'revolut_transfer';
                                            const accountId = String(details.account_id ?? '').trim();
                                            const instructionText = removePaymentDeadlineLine(details.instructions);
                                            const instructionWithoutAccountId = accountId
                                                ? instructionText
                                                    .replace(new RegExp(`\\bThe\\s+${escapeRegExp(accountId)}\\b`, 'gi'), '')
                                                    .replace(new RegExp(`\\b${escapeRegExp(accountId)}\\b`, 'gi'), '')
                                                    .replace(/\s{2,}/g, ' ')
                                                    .trim()
                                                : instructionText;

                                            return (
                                                <label key={method} className="block rounded-xl border border-[#d8dbe1] bg-white p-3 text-sm text-[#2a2f38]">
                                                    <span className="flex items-start gap-2">
                                                        <input
                                                            type="radio"
                                                            name="payment_method"
                                                            value={method}
                                                            checked={paymentMethod === method}
                                                            onChange={() => {
                                                                setPaymentMethod(method);
                                                                setFormErrors((prev) => {
                                                                    const next = { ...prev };
                                                                    delete next.payment_method;
                                                                    return next;
                                                                });
                                                            }}
                                                        />
                                                        <span>
                                                            <div className="font-semibold">{details.display_name || method}</div>
                                                            <div className="text-sm text-[#9aa1af]">You will receive instructions to complete payment.</div>
                                                        </span>
                                                    </span>
                                                    {paymentMethod === method && (
                                                        <div className="mt-2 rounded-xl border border-[#dde0e6] bg-[#f8fafc] p-3 text-sm leading-relaxed text-[#2a2f38]">
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
                                                            {instructionWithoutAccountId && (
                                                                <div className="mt-2">{instructionWithoutAccountId}</div>
                                                            )}
                                                            {details.reference_hint && (
                                                                <div className="mt-1 text-xs text-[#9aa1af]">{removePaymentDeadlineLine(details.reference_hint)}</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {formErrors.payment_method && <p className="mt-2 text-sm text-red-600">{formErrors.payment_method}</p>}
                                    {formErrors.ticket_guests && <p className="mt-2 text-sm text-red-600">{formErrors.ticket_guests}</p>}
                                </div>
                                <div className="mt-4 space-y-1 text-sm text-[#9aa1af]">
                                    <div className="flex items-center justify-between">
                                        <span>Items</span>
                                        <span>{totals.count}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-[#dde0e6] pb-2">
                                        <span>Subtotal</span>
                                        <span>€{Number(totals.total).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-lg font-semibold text-[#2a2f38]">Total</span>
                                    <span className="text-lg font-semibold text-[#2a2f38]">€{Number(totals.total).toFixed(2)}</span>
                                </div>

                                <div className="mt-6 flex items-center gap-2">
                                    <Link href="/cart" className="inline-flex h-11 items-center justify-center rounded-xl border border-[#2e3440] px-4 text-sm font-semibold text-[#2a2f38]" onClick={() => window.dispatchEvent(new CustomEvent('cart:updated'))}>Back to cart</Link>
                                    <button
                                        type="button"
                                        className="inline-flex h-11 items-center justify-center rounded-xl bg-[#f97316] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#ecd4c3]"
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

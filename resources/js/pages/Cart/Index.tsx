import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import React from 'react';

export default function CartIndex() {
    const page = usePage();
    const cart = page.props?.cart;

    return (
        <AppLayout>
            <Head>
                <title>Your Cart</title>
            </Head>

            <div className="p-4">
                <h1 className="text-xl font-semibold">Shopping Cart</h1>
                {cart && cart.items && cart.items.length > 0 ? (
                    <div className="mt-4 space-y-2">
                        {cart.items.map((i: any) => (
                            <div key={i.id} className="border p-2 rounded flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{i.ticket_id ? `Ticket #${i.ticket_id}` : 'Item'}</div>
                                    <div className="text-sm text-muted">Qty: {i.quantity}</div>
                                </div>
                                <div className="font-medium">${Number(i.price).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-muted mt-4">Your cart is empty.</div>
                )}
            </div>
        </AppLayout>
    );
}

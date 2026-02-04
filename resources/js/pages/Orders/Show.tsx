import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import React from 'react';

export default function OrdersShow() {
    const page = usePage();
    const order = page.props?.order ?? {};

    return (
        <AppLayout>
            <Head>
                <title>Order #{order.id}</title>
            </Head>

            <div className="p-4">
                <h1 className="text-xl font-semibold">Order #{order.id}</h1>
                <div className="mt-2 text-sm text-muted">Placed: {order.created_at}</div>
                <div className="mt-4">
                    <div className="font-medium">Items</div>
                    <div className="mt-2 space-y-2">
                        {order.items?.map((it: any) => (
                            <div key={it.id} className="flex items-center justify-between border p-2 rounded">
                                <div>
                                    <div className="font-medium">{it.ticket?.name ?? 'Item'}</div>
                                    <div className="text-sm text-muted">Qty: {it.quantity}</div>
                                </div>
                                <div className="text-right">€{Number(it.price).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-medium">Total: €{Number(order.total ?? 0).toFixed(2)}</div>
                    <a href={`/orders/${order.id}/receipt`} className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm text-white">Download receipt (PDF)</a>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import React from 'react';

export default function OrdersIndex() {
    const page = usePage();
    const orders = page.props?.orders ?? { data: [] };

    return (
        <AppLayout>
            <Head>
                <title>Orders</title>
            </Head>

            <div className="p-4">
                <h1 className="text-xl font-semibold">Orders</h1>
                <div className="mt-4 space-y-3">
                    {orders.data.length === 0 ? (
                        <div className="text-sm text-muted">No orders yet.</div>
                    ) : (
                        orders.data.map((o: any) => (
                            <div key={o.id} className="p-3 border rounded">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">Order #{o.id}</div>
                                        <div className="text-sm text-muted">Placed: {o.created_at}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">€{Number(o.total).toFixed(2)}</div>
                                        <div className="text-sm text-muted">Items: {o.items?.length ?? 0}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

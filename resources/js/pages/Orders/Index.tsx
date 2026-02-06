import { Head, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import React from 'react';

export default function OrdersIndex() {
    const page = usePage();
    const orders = page.props?.orders ?? { data: [] };

    return (
        <AppLayout>
            <Head title="Orders" />

            <div className="p-4">
                <h1 className="text-xl font-semibold">Orders</h1>
                <div className="mt-4 space-y-3">
                    {orders.data.length === 0 ? (
                        <div className="text-sm text-muted">No orders yet.</div>
                    ) : (
                        orders.data.map((o: any) => (
                            <Link key={o.id} href={`/orders/${o.id}`} className="block p-3 border rounded hover:bg-gray-50" as="a">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">Order #{o.id}</div>
                                        <div className="text-sm text-muted">Placed: {o.created_at}</div>
                                        {o.booking_code ? <div className="text-sm">Booking: <strong>{o.booking_code}</strong></div> : null}
                                        {o.contact_name ? <div className="text-sm">Contact: {o.contact_name}</div> : null}
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">€{Number(o.total).toFixed(2)}</div>
                                        <div className="text-sm text-muted">Ticket types: {o.items?.length ?? 0}</div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

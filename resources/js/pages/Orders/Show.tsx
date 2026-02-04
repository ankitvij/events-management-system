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

            {page.props?.flash?.success && (
                <div className="p-4">
                    <div className="rounded-md bg-green-600 p-3 text-white">{page.props.flash.success}</div>
                </div>
            )}

            <div className="p-4">
                <h1 className="text-xl font-semibold">Order #{order.id}</h1>
                <div className="mt-2 text-sm text-muted">Placed: {order.created_at}</div>
                {order.booking_code && (
                    <div className="mt-2 text-sm">Booking code: <strong>{order.booking_code}</strong></div>
                )}
                { (order.contact_email || order.user?.email) && (
                    <div className="mt-2 text-sm text-muted">Confirmation sent to: <strong>{order.contact_email ?? order.user?.email}</strong></div>
                ) }
                <div className="mt-4">
                    <div className="font-medium">Items</div>
                    <div className="mt-2 space-y-2">
                        {order.items?.map((it: any) => (
                            <div key={it.id} className="flex items-center justify-between border p-2 rounded">
                                <div className="flex items-center gap-3">
                                    {it.event?.image_thumbnail_url && (
                                        <img src={it.event.image_thumbnail_url} alt={it.event?.title} className="w-20 h-14 object-cover rounded" />
                                    )}
                                    <div>
                                        <div className="font-medium">{it.ticket?.name ?? 'Item'}</div>
                                        <div className="text-sm text-muted">Type</div>
                                        <div className="text-sm text-muted">Qty: {it.quantity}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div>€{Number(it.price).toFixed(2)}</div>
                                        <div className="mt-2">
                                        {(() => {
                                            const payload = JSON.stringify({
                                                booking_code: order.booking_code,
                                                order_id: order.id,
                                                item_id: it.id,
                                                ticket_id: it.ticket_id,
                                                customer_name: order.contact_name ?? order.user?.name ?? null,
                                                customer_email: order.contact_email ?? order.user?.email ?? null,
                                                event: it.event?.title ?? null,
                                                start_at: it.event?.start_at ?? null,
                                                ticket_type: it.ticket?.name ?? null,
                                            });
                                            const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payload)}`;
                                            return <img src={url} alt="QR" className="w-16 h-16" />;
                                        })()}
                                    </div>
                                </div>
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

import { Head, router, usePage } from '@inertiajs/react';
import ActionButton from '@/components/ActionButton';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type VendorBookingRequest = {
    id: number;
    status: 'pending' | 'accepted' | 'declined' | string;
    message?: string | null;
    created_at?: string | null;
    responded_at?: string | null;
    event?: { id: number; title: string; slug?: string | null; start_at?: string | null };
};

type Props = {
    vendor: { id: number; name: string; email: string };
    bookingRequests: VendorBookingRequest[];
};

export default function VendorBookings({ vendor, bookingRequests }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vendor', href: '/vendor/calendar' },
        { title: 'Bookings', href: '/vendor/bookings' },
    ];

    const page = usePage<{ flash?: { success?: string; error?: string } }>();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vendor Booking Requests" />

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Booking requests</h1>
                        <div className="text-sm text-muted">Signed in as {vendor.email}</div>
                    </div>
                    <div className="flex gap-2">
                        <ActionButton href="/vendor/calendar">Calendar</ActionButton>
                        <button type="button" className="btn-secondary" onClick={() => router.post('/vendors/logout')}>Logout</button>
                    </div>
                </div>

                {page.props?.flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                        {page.props.flash.success}
                    </div>
                )}
                {page.props?.flash?.error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                        {page.props.flash.error}
                    </div>
                )}

                <div className="grid gap-3">
                    {bookingRequests.length ? bookingRequests.map((br) => (
                        <div key={br.id} className="box">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="font-medium break-words">{br.event?.title ?? 'Event'}</div>
                                    <div className="text-sm text-muted">
                                        Status: {br.status}
                                        {br.event?.start_at ? ` · Date: ${new Date(br.event.start_at).toLocaleDateString()}` : ''}
                                    </div>
                                    {br.message ? (
                                        <div className="mt-2 text-sm whitespace-pre-wrap">{br.message}</div>
                                    ) : null}
                                </div>

                                {br.status === 'pending' ? (
                                    <div className="flex gap-2 shrink-0">
                                        <button type="button" className="btn-primary" onClick={() => router.post(`/vendor/bookings/${br.id}/accept`, {}, { preserveScroll: true })}>Accept</button>
                                        <button type="button" className="btn-secondary" onClick={() => router.post(`/vendor/bookings/${br.id}/decline`, {}, { preserveScroll: true })}>Decline</button>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )) : (
                        <div className="text-sm text-muted">No booking requests yet.</div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

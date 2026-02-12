import { Head, router, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import ActionButton from '@/components/ActionButton';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Availability = {
    id: number;
    date: string;
    is_available: boolean;
};

type Props = {
    artist: { id: number; name: string; email: string };
    availabilities: Availability[];
};

export default function ArtistCalendar({ artist, availabilities }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Artist', href: '/artist/calendar' },
        { title: 'Calendar', href: '/artist/calendar' },
    ];

    const page = usePage<{ flash?: { success?: string; error?: string } }>();

    const form = useForm({
        date: '',
        is_available: true,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/artist/calendar', { preserveScroll: true, onSuccess: () => form.reset('date') });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Artist Calendar" />

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Calendar</h1>
                        <div className="text-sm text-muted">Signed in as {artist.email}</div>
                    </div>
                    <div className="flex gap-2">
                        <ActionButton href="/artist/bookings">Booking requests</ActionButton>
                        <button type="button" className="btn-secondary" onClick={() => router.post('/artists/logout')}>Logout</button>
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

                <div className="box">
                    <h2 className="text-sm font-medium">Add date</h2>
                    <form onSubmit={submit} className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium">Date</label>
                            <input id="date" name="date" type="date" required value={form.data.date} onChange={e => form.setData('date', e.target.value)} className="input" />
                        </div>
                        <div>
                            <label htmlFor="is_available" className="block text-sm font-medium">Status</label>
                            <select id="is_available" name="is_available" className="input" value={form.data.is_available ? '1' : '0'} onChange={e => form.setData('is_available', e.target.value === '1')}>
                                <option value="1">Available</option>
                                <option value="0">Not available</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="btn-primary" disabled={form.processing}>Save</button>
                        </div>
                    </form>
                    {Object.keys(form.errors).length > 0 && (
                        <div className="mt-3 text-sm text-red-600">
                            {Object.values(form.errors).map((err, idx) => (
                                <div key={idx}>{err}</div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="box">
                    <h2 className="text-sm font-medium">Your dates</h2>
                    <div className="mt-3 grid gap-2">
                        {availabilities.length ? availabilities.map((a) => (
                            <div key={a.id} className="flex items-center justify-between rounded border p-3">
                                <div>
                                    <div className="font-medium">{a.date}</div>
                                    <div className="text-sm text-muted">{a.is_available ? 'Available' : 'Not available'}</div>
                                </div>
                                <button type="button" className="btn-danger" onClick={() => router.delete(`/artist/calendar/${a.id}`, { preserveScroll: true })}>Remove</button>
                            </div>
                        )) : (
                            <div className="text-sm text-muted">No dates added yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

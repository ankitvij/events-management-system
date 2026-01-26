import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { FormEvent } from 'react';

type Props = { event: any };

export default function Edit({ event }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Events', href: '/events' },
        { title: event.title, href: `/events/${event.id}` },
        { title: 'Edit', href: `/events/${event.id}/edit` },
    ];

    const form = useForm({
        title: event.title || '',
        description: event.description || '',
        start_at: event.start_at || '',
        end_at: event.end_at || '',
        location: event.location || '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(`/events/${event.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${event.title}`} />

            <form onSubmit={submit} className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Title</label>
                    <input value={form.data.title} onChange={e => form.setData('title', e.target.value)} className="input" />
                </div>

                <div>
                    <label className="block text-sm font-medium">Location</label>
                    <input value={form.data.location} onChange={e => form.setData('location', e.target.value)} className="input" />
                </div>

                <div>
                    <label className="block text-sm font-medium">Start</label>
                    <input type="datetime-local" value={form.data.start_at} onChange={e => form.setData('start_at', e.target.value)} className="input" />
                </div>

                <div>
                    <label className="block text-sm font-medium">End</label>
                    <input type="datetime-local" value={form.data.end_at} onChange={e => form.setData('end_at', e.target.value)} className="input" />
                </div>

                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea value={form.data.description} onChange={e => form.setData('description', e.target.value)} className="input" />
                </div>

                <div>
                    <button type="submit" className="btn-primary" disabled={form.processing}>Save</button>
                </div>
            </form>
        </AppLayout>
    );
}

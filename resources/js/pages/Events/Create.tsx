import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { FormEvent } from 'react';

export default function Create() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Events', href: '/events' },
        { title: 'Create', href: '/events/create' },
    ];

    const form = useForm({
        title: '',
        description: '',
        start_at: '',
        end_at: '',
        location: '',
        active: true,
        image: null,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/events', { forceFormData: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Event" />

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
                    <label className="block text-sm font-medium">Image</label>
                    <input type="file" onChange={e => form.setData('image', e.target.files?.[0] ?? null)} accept="image/*" />
                </div>

                <div>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={!!form.data.active} onChange={e => form.setData('active', e.target.checked)} />
                        <span className="text-sm">Active</span>
                    </label>
                </div>

                <div>
                    <button type="submit" className="btn-primary" disabled={form.processing}>Create</button>
                </div>
            </form>
        </AppLayout>
    );
}

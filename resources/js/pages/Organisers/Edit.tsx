import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Organiser } from '@/types/entities';

export default function Edit({ organiser }: { organiser: Organiser }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Organisers', href: '/organisers' },
        { title: 'Edit', href: `/organisers/${organiser.id}/edit` },
    ];

    const form = useForm({
        name: organiser.name || '',
        email: organiser.email || '',
        active: organiser.active ?? true,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(`/organisers/${organiser.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Organiser" />

            <form onSubmit={submit} className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input name="name" value={form.data.name} onChange={e => form.setData('name', e.target.value)} className="input" />
                    {form.errors.name && <div className="text-sm text-destructive mt-1">{form.errors.name}</div>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input name="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)} className="input" />
                    {form.errors.email && <div className="text-sm text-destructive mt-1">{form.errors.email}</div>}
                </div>

                <div>
                    <label className="flex items-center gap-2">
                        <input name="active" type="checkbox" checked={!!form.data.active} onChange={e => form.setData('active', e.target.checked)} />
                        <span className="text-sm">Active</span>
                    </label>
                </div>

                <div>
                    <button type="submit" className="btn-primary" disabled={form.processing}>Save</button>
                </div>
            </form>
        </AppLayout>
    );
}

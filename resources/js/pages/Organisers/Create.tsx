import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

export default function Create() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Organisers', href: '/organisers' },
        { title: 'Create', href: '/organisers/create' },
    ];

    const form = useForm({
        name: '',
        email: '',
        active: true,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/organisers');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Organiser" />

            <form onSubmit={submit} className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input value={form.data.name} onChange={e => form.setData('name', e.target.value)} className="input" />
                    {form.errors.name && <div className="text-sm text-destructive mt-1">{form.errors.name}</div>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input value={form.data.email} onChange={e => form.setData('email', e.target.value)} className="input" />
                    {form.errors.email && <div className="text-sm text-destructive mt-1">{form.errors.email}</div>}
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

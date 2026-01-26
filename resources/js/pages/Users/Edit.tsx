import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { FormEvent } from 'react';

export default function Edit({ user }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Users', href: '/users' },
        { title: user.name, href: `/users/${user.id}` },
        { title: 'Edit', href: `/users/${user.id}/edit` },
    ];

    const form = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(`/users/${user.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${user.name}`} />

            <form onSubmit={submit} className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input value={form.data.name} onChange={e => form.setData('name', e.target.value)} className="input" />
                </div>

                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input value={form.data.email} onChange={e => form.setData('email', e.target.value)} className="input" />
                </div>

                <div>
                    <label className="block text-sm font-medium">Password (leave empty to keep)</label>
                    <input type="password" value={form.data.password} onChange={e => form.setData('password', e.target.value)} className="input" />
                </div>

                <div>
                    <button type="submit" className="btn-primary" disabled={form.processing}>Save</button>
                </div>
            </form>
        </AppLayout>
    );
}

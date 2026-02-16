import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import ActionButton from '@/components/ActionButton';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Agency = {
    id: number;
    name: string;
    email?: string | null;
    active?: boolean;
};

export default function EditAgency({ agency }: { agency: Agency }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Agencies', href: '/agencies' },
        { title: agency.name, href: `/agencies/${agency.id}` },
        { title: 'Edit', href: `/agencies/${agency.id}/edit` },
    ];

    const form = useForm({
        name: agency.name ?? '',
        email: agency.email ?? '',
        active: agency.active ?? true,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(`/agencies/${agency.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${agency.name}`} />

            <form onSubmit={submit} className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input name="name" className="input" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                    {form.errors.name && <div className="mt-1 text-sm text-destructive">{form.errors.name}</div>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input name="email" type="email" className="input" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                    {form.errors.email && <div className="mt-1 text-sm text-destructive">{form.errors.email}</div>}
                </div>

                <div>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={!!form.data.active} onChange={(e) => form.setData('active', e.target.checked)} />
                        <span className="text-sm">Active</span>
                    </label>
                </div>

                <div>
                    <ActionButton type="submit">Save</ActionButton>
                </div>
            </form>
        </AppLayout>
    );
}

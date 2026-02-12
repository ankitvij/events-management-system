import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import ActionButton from '@/components/ActionButton';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Vendor } from '@/types/entities';

type Props = {
    vendor: Vendor;
    types: string[];
};

export default function VendorsEdit({ vendor, types }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vendors', href: '/vendors' },
        { title: vendor.name, href: `/vendors/${vendor.id}` },
        { title: 'Edit', href: `/vendors/${vendor.id}/edit` },
    ];

    const form = useForm({
        name: vendor.name ?? '',
        email: vendor.email ?? '',
        type: vendor.type ?? (types?.[0] ?? 'other'),
        city: vendor.city ?? '',
        description: vendor.description ?? '',
        active: !!vendor.active,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(`/vendors/${vendor.id}`, { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${vendor.name}`} />

            <form onSubmit={submit} className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Name <span className="text-red-600">*</span></label>
                    <input className="input" required value={form.data.name} onChange={e => form.setData('name', e.target.value)} />
                    {form.errors.name && <p className="mt-1 text-sm text-red-600">{form.errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Email <span className="text-red-600">*</span></label>
                    <input className="input" type="email" required value={form.data.email} onChange={e => form.setData('email', e.target.value)} />
                    {form.errors.email && <p className="mt-1 text-sm text-red-600">{form.errors.email}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Type <span className="text-red-600">*</span></label>
                    <select className="input" required value={form.data.type} onChange={e => form.setData('type', e.target.value)}>
                        {types.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    {form.errors.type && <p className="mt-1 text-sm text-red-600">{form.errors.type}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">City</label>
                    <input className="input" value={form.data.city} onChange={e => form.setData('city', e.target.value)} />
                    {form.errors.city && <p className="mt-1 text-sm text-red-600">{form.errors.city}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea className="input" rows={4} value={form.data.description} onChange={e => form.setData('description', e.target.value)} />
                    {form.errors.description && <p className="mt-1 text-sm text-red-600">{form.errors.description}</p>}
                </div>

                <div>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={!!form.data.active} onChange={e => form.setData('active', e.target.checked)} />
                        <span className="text-sm text-muted">Active</span>
                    </label>
                    {form.errors.active && <p className="mt-1 text-sm text-red-600">{form.errors.active}</p>}
                </div>

                <div className="flex gap-2">
                    <ActionButton type="submit" className={form.processing ? 'opacity-60 pointer-events-none' : ''}>Save</ActionButton>
                    <ActionButton href={`/vendors/${vendor.id}`} className="btn-secondary">Cancel</ActionButton>
                </div>
            </form>
        </AppLayout>
    );
}

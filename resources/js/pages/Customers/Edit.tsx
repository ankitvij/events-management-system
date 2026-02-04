import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Customer } from '@/types/entities';

export default function Edit({ customer }: { customer: Customer }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/customers' },
        { title: 'Edit', href: `/customers/${customer.id}/edit` },
    ];

    const form = useForm({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        active: customer.active ?? true,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(`/customers/${customer.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Customer" />

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
                    <label className="block text-sm font-medium">Phone</label>
                    <input name="phone" value={form.data.phone} onChange={e => form.setData('phone', e.target.value)} className="input" />
                    {form.errors.phone && <div className="text-sm text-destructive mt-1">{form.errors.phone}</div>}
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

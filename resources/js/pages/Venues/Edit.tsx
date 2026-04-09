import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import ActionButton from '@/components/ActionButton';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Venue } from '@/types/entities';

type Props = {
    venue: Venue;
};

export default function VenuesEdit({ venue }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Venues', href: '/venues' },
        { title: venue.name, href: `/venues/${venue.id}` },
        { title: 'Edit', href: `/venues/${venue.id}/edit` },
    ];

    const form = useForm({
        name: venue.name ?? '',
        email: venue.email ?? '',
        city: venue.city ?? '',
        description: venue.description ?? '',
        active: !!venue.active,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(`/venues/${venue.id}`, { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${venue.name}`} />

            <form onSubmit={submit} className="p-4 space-y-4">
                <div>
                    <label htmlFor="venue_name" className="block text-sm font-medium">Name <span className="text-red-600">*</span></label>
                    <input id="venue_name" className="input" title="Venue name" placeholder="Venue name" required value={form.data.name} onChange={e => form.setData('name', e.target.value)} />
                    {form.errors.name && <p className="mt-1 text-sm text-red-600">{form.errors.name}</p>}
                </div>

                <div>
                    <label htmlFor="venue_email" className="block text-sm font-medium">Email <span className="text-red-600">*</span></label>
                    <input id="venue_email" className="input" type="email" title="Venue email" placeholder="venue@example.com" required value={form.data.email} onChange={e => form.setData('email', e.target.value)} />
                    {form.errors.email && <p className="mt-1 text-sm text-red-600">{form.errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="venue_city" className="block text-sm font-medium">City</label>
                    <input id="venue_city" className="input" title="Venue city" placeholder="City" value={form.data.city} onChange={e => form.setData('city', e.target.value)} />
                    {form.errors.city && <p className="mt-1 text-sm text-red-600">{form.errors.city}</p>}
                </div>

                <div>
                    <label htmlFor="venue_description" className="block text-sm font-medium">Description</label>
                    <textarea id="venue_description" className="input" title="Venue description" placeholder="Add venue details" rows={4} value={form.data.description} onChange={e => form.setData('description', e.target.value)} />
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
                    <ActionButton href={`/venues/${venue.id}`} className="btn-secondary">Cancel</ActionButton>
                </div>
            </form>
        </AppLayout>
    );
}

import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import OrganiserMultiSelect from '@/components/organiser-multi-select';
import ActionButton from '@/components/ActionButton';
import RichEditor from '@/components/RichEditor';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

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
        city: '',
        address: '',
        country: '',
        active: true,
        image: null,
        organiser_ids: [],
        organiser_emails: '',
        organiser_name: '',
        organiser_email: '',
    });

    const page = usePage();
    const organisers = page.props?.organisers ?? [];
    const showOrganisers = page.props?.showOrganisers ?? false;
    const showHomeHeader = page.props?.showHomeHeader ?? false;

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/events', { forceFormData: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Event" />

            <div className={showHomeHeader ? 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8' : 'p-4'}>
                <form onSubmit={submit} className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Title</label>
                    <input name="title" value={form.data.title} onChange={e => form.setData('title', e.target.value)} className="input" />
                </div>

                <div>
                    <label className="block text-sm font-medium">Location</label>
                    <input name="location" value={form.data.location} onChange={e => form.setData('location', e.target.value)} className="input" />
                </div>

                <div>
                    <label className="block text-sm font-medium">City</label>
                    <input name="city" value={form.data.city} onChange={e => form.setData('city', e.target.value)} className="input" />
                </div>

                <div>
                    <label className="block text-sm font-medium">Country</label>
                    <input name="country" value={form.data.country} onChange={e => form.setData('country', e.target.value)} className="input" />
                </div>

                <div>
                    <label className="block text-sm font-medium">Address</label>
                    <input name="address" value={form.data.address} onChange={e => form.setData('address', e.target.value)} className="input" />
                </div>

                <div>
                    <label className="block text-sm font-medium">Start</label>
                    <input name="start_at" type="datetime-local" value={form.data.start_at} onChange={e => form.setData('start_at', e.target.value)} className="input" />
                </div>

                <div>
                    <label className="block text-sm font-medium">End</label>
                    <input name="end_at" type="datetime-local" value={form.data.end_at} onChange={e => form.setData('end_at', e.target.value)} className="input" />
                </div>

                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <RichEditor value={form.data.description} onChange={v => form.setData('description', v)} />
                </div>

                <div>
                    <label className="block text-sm font-medium">Image</label>
                    <input name="image" type="file" onChange={e => form.setData('image', e.target.files?.[0] ?? null)} accept="image/*" />
                </div>

                <div>
                    <label className="block text-sm font-medium">Organisers</label>
                    {showOrganisers ? (
                        <>
                            <OrganiserMultiSelect organisers={organisers} value={form.data.organiser_ids} onChange={(v: number[]) => form.setData('organiser_ids', v)} />
                            <p className="text-sm text-muted mt-2">Or add organiser email addresses (comma-separated) to create organisers on submit.</p>
                            <input name="organiser_emails" value={form.data.organiser_emails} onChange={e => form.setData('organiser_emails', e.target.value)} placeholder="organiser1@example.com, organiser2@example.com" className="input mt-2" />
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-muted">You are creating an event as a guest. Please provide an organiser name and email to create an organiser record for this event.</p>
                            <input name="organiser_name" value={form.data.organiser_name} onChange={e => form.setData('organiser_name', e.target.value)} placeholder="Organiser name" className="input mt-2" />
                            <input name="organiser_email" value={form.data.organiser_email} onChange={e => form.setData('organiser_email', e.target.value)} placeholder="organiser@example.com" className="input mt-2" />
                        </>
                    )}
                </div>

                <div>
                    <label className="flex items-center gap-2">
                        <input name="active" type="checkbox" checked={!!form.data.active} onChange={e => form.setData('active', e.target.checked)} />
                        <span className="text-sm">Active</span>
                    </label>
                </div>

                <div>
                    <ActionButton type="submit">Create</ActionButton>
                </div>
                </form>
            </div>
        </AppLayout>
    );
}

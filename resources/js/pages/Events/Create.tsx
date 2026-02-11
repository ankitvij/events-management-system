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
        city: '',
        address: '',
        facebook_url: '',
        instagram_url: '',
        whatsapp_url: '',
        country: '',
        active: true,
        image: null,
        organiser_id: null,
        organiser_ids: [],
        organiser_emails: '',
        organiser_name: '',
        organiser_email: '',
        edit_password: '',
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
                {Object.keys(form.errors).length > 0 && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
                        <p className="font-semibold">Please fix the following:</p>
                        <ul className="list-disc pl-5">
                            {Object.values(form.errors).map((err, idx) => (
                                <li key={idx}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium">Title <span className="text-red-600">*</span></label>
                    <input name="title" required value={form.data.title} onChange={e => form.setData('title', e.target.value)} className="input" />
                    {form.errors.title && <p className="mt-1 text-sm text-red-600">{form.errors.title}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">City</label>
                    <input name="city" value={form.data.city} onChange={e => form.setData('city', e.target.value)} className="input" />
                    {form.errors.city && <p className="mt-1 text-sm text-red-600">{form.errors.city}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Country</label>
                    <input name="country" value={form.data.country} onChange={e => form.setData('country', e.target.value)} className="input" />
                    {form.errors.country && <p className="mt-1 text-sm text-red-600">{form.errors.country}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Address</label>
                    <input name="address" value={form.data.address} onChange={e => form.setData('address', e.target.value)} className="input" />
                    {form.errors.address && <p className="mt-1 text-sm text-red-600">{form.errors.address}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Start date <span className="text-red-600">*</span></label>
                    <input name="start_at" type="date" required value={form.data.start_at} onChange={e => form.setData('start_at', e.target.value)} className="input" />
                    {form.errors.start_at && <p className="mt-1 text-sm text-red-600">{form.errors.start_at}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">End date</label>
                    <input name="end_at" type="date" value={form.data.end_at} onChange={e => form.setData('end_at', e.target.value)} className="input" />
                    {form.errors.end_at && <p className="mt-1 text-sm text-red-600">{form.errors.end_at}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Facebook link (optional)</label>
                    <input name="facebook_url" value={form.data.facebook_url} onChange={e => form.setData('facebook_url', e.target.value)} className="input" placeholder="https://facebook.com/yourpage" />
                    {form.errors.facebook_url && <p className="mt-1 text-sm text-red-600">{form.errors.facebook_url}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Instagram link (optional)</label>
                    <input name="instagram_url" value={form.data.instagram_url} onChange={e => form.setData('instagram_url', e.target.value)} className="input" placeholder="https://instagram.com/yourpage" />
                    {form.errors.instagram_url && <p className="mt-1 text-sm text-red-600">{form.errors.instagram_url}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">WhatsApp (optional)</label>
                    <input name="whatsapp_url" value={form.data.whatsapp_url} onChange={e => form.setData('whatsapp_url', e.target.value)} className="input" placeholder="https://wa.me/1234567890" />
                    {form.errors.whatsapp_url && <p className="mt-1 text-sm text-red-600">{form.errors.whatsapp_url}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <RichEditor value={form.data.description} onChange={v => form.setData('description', v)} />
                </div>

                <div>
                    <label className="block text-sm font-medium">Image</label>
                    <input name="image" type="file" onChange={e => form.setData('image', e.target.files?.[0] ?? null)} accept="image/*" />
                    {form.errors.image && <p className="mt-1 text-sm text-red-600">{form.errors.image}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Organisers</label>
                    {showOrganisers ? (
                        <>
                            <div className="mb-3">
                                <label className="block text-sm font-medium">Main organiser <span className="text-red-600">*</span></label>
                                <select
                                    className="input"
                                    required
                                    value={form.data.organiser_id ?? ''}
                                    onChange={e => form.setData('organiser_id', e.target.value ? Number(e.target.value) : null)}
                                >
                                    <option value="">Select organiser</option>
                                    {organisers.map((o: any) => (
                                        <option key={o.id} value={o.id}>{o.name}</option>
                                    ))}
                                </select>
                                <p className="text-sm text-muted mt-1">Required: used as the primary organiser for bank details and display.</p>
                                {form.errors.organiser_id && <p className="mt-1 text-sm text-red-600">{form.errors.organiser_id}</p>}
                            </div>

                            <OrganiserMultiSelect organisers={organisers} value={form.data.organiser_ids} onChange={(v: number[]) => form.setData('organiser_ids', v)} />
                            <p className="text-sm text-muted mt-2">Or add organiser email addresses (comma-separated) to create organisers on submit.</p>
                            <input name="organiser_emails" value={form.data.organiser_emails} onChange={e => form.setData('organiser_emails', e.target.value)} placeholder="organiser1@example.com, organiser2@example.com" className="input mt-2" />
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-muted">You are creating an event as a guest. Please provide an organiser name and email to create an organiser record for this event.</p>
                            <label className="block text-sm font-medium mt-2">Organiser name <span className="text-red-600">*</span></label>
                            <input required name="organiser_name" value={form.data.organiser_name} onChange={e => form.setData('organiser_name', e.target.value)} placeholder="Organiser name" className="input mt-1" />
                            {form.errors.organiser_name && <p className="mt-1 text-sm text-red-600">{form.errors.organiser_name}</p>}
                            <label className="block text-sm font-medium mt-2">Organiser email <span className="text-red-600">*</span></label>
                            <input required name="organiser_email" type="email" value={form.data.organiser_email} onChange={e => form.setData('organiser_email', e.target.value)} placeholder="organiser@example.com" className="input mt-1" />
                            {form.errors.organiser_email && <p className="mt-1 text-sm text-red-600">{form.errors.organiser_email}</p>}
                            <label className="block text-sm font-medium mt-2">Edit password (optional)</label>
                            <input name="edit_password" type="password" value={form.data.edit_password} onChange={e => form.setData('edit_password', e.target.value)} placeholder="Set a password to protect the edit link" className="input mt-1" />
                            {form.errors.edit_password && <p className="mt-1 text-sm text-red-600">{form.errors.edit_password}</p>}
                            {form.errors.organiser_email && <p className="mt-1 text-sm text-red-600">{form.errors.organiser_email}</p>}

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

import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import OrganiserMultiSelect from '@/components/organiser-multi-select';
import RichEditor from '@/components/RichEditor';
import ActionButton from '@/components/ActionButton';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Event, Organiser } from '@/types/entities';

type Props = { event: Event };

export default function Edit({ event }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Events', href: '/events' },
        { title: event.title, href: `/${event.slug}` },
        { title: 'Edit', href: `/events/${event.slug}/edit` },
    ];

    const form = useForm({
        title: event.title || '',
        description: event.description || '',
        start_at: event.start_at ? event.start_at.slice(0, 10) : '',
        end_at: event.end_at ? event.end_at.slice(0, 10) : '',
        city: event.city || '',
        country: event.country || '',
        address: event.address || '',
        facebook_url: event.facebook_url || '',
        instagram_url: event.instagram_url || '',
        whatsapp_url: event.whatsapp_url || '',
        active: event.active ?? true,
        image: null,
        organiser_ids: event.organisers ? event.organisers.map((o: Organiser) => o.id) : [],
        edit_password: '',
    });

    const page = usePage();
    const organisers = page.props?.organisers ?? [];
    const editUrl = (page.props as any)?.editUrl as string | undefined;
    const requiresPassword = Boolean((page.props as any)?.requiresPassword);
    const allowOrganiserChange = (page.props as any)?.allowOrganiserChange ?? true;

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(editUrl ?? `/events/${event.slug}`, { forceFormData: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${event.title}`} />

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

                {requiresPassword && (
                    <div>
                        <label className="block text-sm font-medium">Password to edit</label>
                        <input
                            name="edit_password"
                            type="password"
                            value={form.data.edit_password}
                            onChange={e => form.setData('edit_password', e.target.value)}
                            className="input"
                            placeholder="Enter the password shared in your email"
                        />
                        {form.errors.edit_password && <p className="mt-1 text-sm text-red-600">{form.errors.edit_password}</p>}
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
                    <label className="block text-sm font-medium">End</label>
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
<<<<<<< Updated upstream
=======
                    <div className="mb-3">
                        <label className="block text-sm font-medium">Main organiser <span className="text-red-600">*</span></label>
                        <select
                            className="input"
                            required
                            value={form.data.organiser_id ?? ''}
                            onChange={e => form.setData('organiser_id', e.target.value ? Number(e.target.value) : null)}
                            disabled={! allowOrganiserChange}
                        >
                            <option value="">Select organiser</option>
                            {organisers.map((o: any) => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                        </select>
                        <p className="text-sm text-muted mt-1">Required: used as the primary organiser for bank details and display.</p>
                        {! allowOrganiserChange && <p className="text-sm text-muted">Organiser changes are disabled for this link.</p>}
                        {form.errors.organiser_id && <p className="mt-1 text-sm text-red-600">{form.errors.organiser_id}</p>}
                    </div>

>>>>>>> Stashed changes
                    <OrganiserMultiSelect organisers={organisers} value={form.data.organiser_ids} onChange={(v: number[]) => form.setData('organiser_ids', v)} />
                </div>

                <div>
                    <ActionButton type="submit" className={form.processing ? 'opacity-60 pointer-events-none' : ''}>Save</ActionButton>
                </div>
            </form>
        </AppLayout>
    );
}

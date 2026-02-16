import { Head, router, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import ActionButton from '@/components/ActionButton';
import OrganiserMultiSelect from '@/components/organiser-multi-select';
import RichEditor from '@/components/RichEditor';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Event, Organiser } from '@/types/entities';

type ArtistShort = { id: number; name: string; city?: string | null };

type VendorShort = { id: number; name: string; city?: string | null; type?: string | null };
type PromoterShort = { id: number; name: string; email?: string | null };

type BookingRequestRow = {
    id: number;
    status: string;
    message?: string | null;
    created_at?: string | null;
    responded_at?: string | null;
    artist?: { id: number; name: string; email?: string | null };
};

type VendorBookingRequestRow = {
    id: number;
    status: string;
    message?: string | null;
    created_at?: string | null;
    responded_at?: string | null;
    vendor?: { id: number; name: string; email?: string | null };
};

type TicketControllerEmail = {
    id: number;
    email: string;
};

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
        organiser_id: event.organiser_id ?? event.organiser?.id ?? null,
        organiser_ids: event.organisers ? event.organisers.map((o: Organiser) => o.id) : [],
        promoter_ids: ((event as any).promoters ?? []).map((p: PromoterShort) => p.id),
        vendor_ids: ((event as any).vendors ?? []).map((v: VendorShort) => v.id),
        edit_password: '',
    });

    const page = usePage();
    const organisers = page.props?.organisers ?? [];
    const artists = (page.props?.artists ?? []) as ArtistShort[];
    const bookingRequests = (page.props?.bookingRequests ?? []) as BookingRequestRow[];
    const vendors = (page.props?.vendors ?? []) as VendorShort[];
    const promoters = (page.props?.promoters ?? []) as PromoterShort[];
    const vendorBookingRequests = (page.props?.vendorBookingRequests ?? []) as VendorBookingRequestRow[];
    const ticketControllers = (page.props?.ticketControllers ?? []) as TicketControllerEmail[];
    const canManageTicketControllers = Boolean((page.props as any)?.auth?.user);
    const editUrl = (page.props as any)?.editUrl as string | undefined;
    const requiresPassword = Boolean((page.props as any)?.requiresPassword);
    const allowOrganiserChange = (page.props as any)?.allowOrganiserChange ?? true;

    const bookingForm = useForm({
        artist_id: '',
        message: '',
    });

    const vendorBookingForm = useForm({
        vendor_id: '',
        message: '',
    });

    const ticketControllerForm = useForm({
        email: '',
    });

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
                        <label className="block text-sm font-medium">Password</label>
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
                    <label className="block text-sm font-medium">City <span className="text-red-600">*</span></label>
                    <input name="city" required value={form.data.city} onChange={e => form.setData('city', e.target.value)} className="input" />
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
                    <OrganiserMultiSelect organisers={organisers} value={form.data.organiser_ids} onChange={(v: number[]) => form.setData('organiser_ids', v)} />
                </div>

                {canManageTicketControllers && (
                <div className="border-t pt-4">
                    <h3 className="text-sm font-medium">Ticket controllers</h3>
                    <p className="mt-1 text-sm text-muted">Add up to 10 emails for ticket controller access to this event.</p>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            ticketControllerForm.post(`/events/${event.slug}/ticket-controllers`, {
                                preserveScroll: true,
                                onSuccess: () => ticketControllerForm.reset('email'),
                            });
                        }}
                        className="mt-3 flex flex-col gap-2 md:flex-row md:items-center"
                    >
                        <input
                            type="email"
                            required
                            value={ticketControllerForm.data.email}
                            onChange={(e) => ticketControllerForm.setData('email', e.target.value)}
                            className="input md:w-96"
                            placeholder="controller@example.com"
                        />
                        <button type="submit" className="btn-primary" disabled={ticketControllerForm.processing}>
                            Add ticket controller
                        </button>
                    </form>
                    {(ticketControllerForm.errors as Record<string, string | undefined>).ticket_controller_email && (
                        <p className="mt-2 text-sm text-red-600">{(ticketControllerForm.errors as Record<string, string>).ticket_controller_email}</p>
                    )}
                    {ticketControllerForm.errors.email && <p className="mt-2 text-sm text-red-600">{ticketControllerForm.errors.email}</p>}

                    <div className="mt-3 grid gap-2">
                        {ticketControllers.length > 0 ? ticketControllers.map((controller) => (
                            <div key={controller.id} className="box flex items-center justify-between">
                                <div className="text-sm">{controller.email}</div>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => router.delete(`/events/${event.slug}/ticket-controllers/${controller.id}`, { preserveScroll: true })}
                                >
                                    Remove
                                </button>
                            </div>
                        )) : (
                            <div className="text-sm text-muted">No ticket controllers added yet.</div>
                        )}
                    </div>
                </div>
                )}

                <div>
                    <label htmlFor="promoter_ids" className="block text-sm font-medium">Promoters</label>
                    <select
                        id="promoter_ids"
                        className="input min-h-28"
                        multiple
                        value={form.data.promoter_ids.map(String)}
                        onChange={(e) => {
                            const values = Array.from(e.target.selectedOptions).map((option) => Number(option.value));
                            form.setData('promoter_ids', values);
                        }}
                    >
                        {promoters.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}{p.email ? ` (${p.email})` : ''}</option>
                        ))}
                    </select>
                    <p className="mt-1 text-sm text-muted">Hold Ctrl (Windows) or Command (Mac) to select multiple.</p>
                </div>

                <div>
                    <label htmlFor="vendor_ids" className="block text-sm font-medium">Linked vendors</label>
                    <select
                        id="vendor_ids"
                        className="input min-h-28"
                        multiple
                        value={form.data.vendor_ids.map(String)}
                        onChange={(e) => {
                            const values = Array.from(e.target.selectedOptions).map((option) => Number(option.value));
                            form.setData('vendor_ids', values);
                        }}
                    >
                        {vendors.map((v) => (
                            <option key={v.id} value={v.id}>{v.name}{v.type ? ` (${v.type})` : ''}{v.city ? ` · ${v.city}` : ''}</option>
                        ))}
                    </select>
                    <p className="mt-1 text-sm text-muted">Hold Ctrl (Windows) or Command (Mac) to select multiple.</p>
                </div>

                <div>
                    <ActionButton type="submit" className={form.processing ? 'opacity-60 pointer-events-none' : ''}>Save</ActionButton>
                </div>

                {artists.length > 0 && (
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium">Booking requests</h3>

                        <div className="mt-3 rounded border border-border bg-muted/20 p-3">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    bookingForm.post(`/events/${event.slug}/booking-requests`, {
                                        preserveScroll: true,
                                        onSuccess: () => bookingForm.reset('artist_id', 'message'),
                                    });
                                }}
                                className="grid grid-cols-1 gap-3 md:grid-cols-2"
                            >
                                <div>
                                    <label htmlFor="artist_id" className="block text-sm font-medium">Artist <span className="text-red-600">*</span></label>
                                    <select
                                        id="artist_id"
                                        className="input"
                                        required
                                        value={bookingForm.data.artist_id}
                                        onChange={e => bookingForm.setData('artist_id', e.target.value)}
                                    >
                                        <option value="">Select artist</option>
                                        {artists.map((a) => (
                                            <option key={a.id} value={String(a.id)}>{a.name}{a.city ? ` (${a.city})` : ''}</option>
                                        ))}
                                    </select>
                                    {bookingForm.errors.artist_id && <p className="mt-1 text-sm text-red-600">{bookingForm.errors.artist_id}</p>}
                                </div>

                                <div>
                                    <label htmlFor="booking_message" className="block text-sm font-medium">Message</label>
                                    <textarea
                                        id="booking_message"
                                        className="input"
                                        rows={3}
                                        value={bookingForm.data.message}
                                        onChange={e => bookingForm.setData('message', e.target.value)}
                                    />
                                    {bookingForm.errors.message && <p className="mt-1 text-sm text-red-600">{bookingForm.errors.message}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <button type="submit" className="btn-secondary" disabled={bookingForm.processing}>
                                        Send booking request
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="mt-3 grid gap-2">
                            {bookingRequests.length ? bookingRequests.map((br) => (
                                <div key={br.id} className="rounded border p-3">
                                    <div className="text-sm">
                                        <span className="font-medium">{br.artist?.name ?? 'Artist'}</span>
                                        <span className="text-muted"> · {br.status}</span>
                                    </div>
                                    {br.message ? <div className="mt-2 text-sm text-muted whitespace-pre-wrap">{br.message}</div> : null}
                                </div>
                            )) : (
                                <div className="text-sm text-muted">No booking requests yet.</div>
                            )}
                        </div>
                    </div>
                )}

                {vendors.length > 0 && (
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium">Vendor booking requests</h3>

                        <div className="mt-3 rounded border border-border bg-muted/20 p-3">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    vendorBookingForm.post(`/events/${event.slug}/vendor-booking-requests`, {
                                        preserveScroll: true,
                                        onSuccess: () => vendorBookingForm.reset('vendor_id', 'message'),
                                    });
                                }}
                                className="grid grid-cols-1 gap-3 md:grid-cols-2"
                            >
                                <div>
                                    <label htmlFor="vendor_id" className="block text-sm font-medium">Vendor <span className="text-red-600">*</span></label>
                                    <select
                                        id="vendor_id"
                                        className="input"
                                        required
                                        value={vendorBookingForm.data.vendor_id}
                                        onChange={e => vendorBookingForm.setData('vendor_id', e.target.value)}
                                    >
                                        <option value="">Select vendor</option>
                                        {vendors.map((v) => (
                                            <option key={v.id} value={String(v.id)}>{v.name}{v.type ? ` (${v.type})` : ''}{v.city ? ` · ${v.city}` : ''}</option>
                                        ))}
                                    </select>
                                    {vendorBookingForm.errors.vendor_id && <p className="mt-1 text-sm text-red-600">{vendorBookingForm.errors.vendor_id}</p>}
                                </div>

                                <div>
                                    <label htmlFor="vendor_booking_message" className="block text-sm font-medium">Message</label>
                                    <textarea
                                        id="vendor_booking_message"
                                        className="input"
                                        rows={3}
                                        value={vendorBookingForm.data.message}
                                        onChange={e => vendorBookingForm.setData('message', e.target.value)}
                                    />
                                    {vendorBookingForm.errors.message && <p className="mt-1 text-sm text-red-600">{vendorBookingForm.errors.message}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <button type="submit" className="btn-secondary" disabled={vendorBookingForm.processing}>
                                        Send vendor booking request
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="mt-3 grid gap-2">
                            {vendorBookingRequests.length ? vendorBookingRequests.map((br) => (
                                <div key={br.id} className="rounded border p-3">
                                    <div className="text-sm">
                                        <span className="font-medium">{br.vendor?.name ?? 'Vendor'}</span>
                                        <span className="text-muted"> · {br.status}</span>
                                    </div>
                                    {br.message ? <div className="mt-2 text-sm text-muted whitespace-pre-wrap">{br.message}</div> : null}
                                </div>
                            )) : (
                                <div className="text-sm text-muted">No vendor booking requests yet.</div>
                            )}
                        </div>
                    </div>
                )}
            </form>
        </AppLayout>
    );
}

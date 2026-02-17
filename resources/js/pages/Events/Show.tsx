import { Head, router, useForm, usePage } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import { ArrowLeft, Pencil } from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import ActionIcon from '@/components/action-icon';
import ActionButton from '@/components/ActionButton';
import OrganiserMultiSelect from '@/components/organiser-multi-select';
import OrganiserPlaceholder from '@/components/organiser-placeholder';
import TicketCreateForm from '@/components/TicketCreateForm';
import TicketItem from '@/components/TicketItem';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Organiser = { id: number; name: string };

type ArtistShort = { id: number; name: string; city?: string | null; photo_url?: string | null };

type VendorShort = { id: number; name: string; city?: string | null; type?: string | null };
type PromoterShort = { id: number; name: string; email?: string | null };
type TicketControllerEmail = { id: number; email: string };

type Event = {
    id: number;
    slug: string;
    title: string;
    description?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    facebook_url?: string | null;
    instagram_url?: string | null;
    whatsapp_url?: string | null;
    image?: string | null;
    image_url?: string | null;
    image_thumbnail?: string | null;
    image_thumbnail_url?: string | null;
    active?: boolean;
    organiser_id?: number | null;
    organisers?: Organiser[];
    user?: { id: number; name?: string | null; email?: string | null } | null;
    start_at?: string | null;
    end_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

type Props = { event: Event };

export default function Show({ event }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Events', href: '/events' },
        { title: event.title, href: `/${event.slug}` },
    ];
    const page = usePage();
    const current = page.props?.auth?.user;
    const showHomeHeader = page.props?.showHomeHeader ?? false;
    const organisers = page.props?.organisers ?? [] as Organiser[];
    const artists = (page.props?.artists ?? []) as ArtistShort[];
    const vendors = (page.props?.vendors ?? []) as VendorShort[];
    const promoters = (page.props?.promoters ?? []) as PromoterShort[];
    const ticketControllers = (page.props?.ticketControllers ?? []) as TicketControllerEmail[];
    const availableArtists = (page.props?.availableArtists ?? []) as ArtistShort[];
    const availableVendors = (page.props?.availableVendors ?? []) as VendorShort[];
    const availablePromoters = (page.props?.availablePromoters ?? []) as PromoterShort[];
    const [artistSearch, setArtistSearch] = useState('');
    const [vendorSearch, setVendorSearch] = useState('');
    const [promoterSearch, setPromoterSearch] = useState('');

    // debug logging removed

    const linksForm = useForm({
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
        organiser_id: event.organiser_id ?? event.organisers?.[0]?.id ?? null,
        organiser_ids: event.organisers ? event.organisers.map((o: Organiser) => o.id) : [],
        promoter_ids: promoters.map((promoter) => promoter.id),
        vendor_ids: vendors.map((vendor) => vendor.id),
        artist_ids: artists.map((artist) => artist.id),
    });
    const ticketControllerForm = useForm({ email: '' });
    const bookingForm = useForm({ artist_id: '', message: '' });
    const vendorBookingForm = useForm({ vendor_id: '', message: '' });

    const filteredAvailableArtists = useMemo(() => {
        const query = artistSearch.trim().toLowerCase();
        if (!query) {
            return availableArtists;
        }

        return availableArtists.filter((artist) =>
            [artist.name, artist.city ?? ''].join(' ').toLowerCase().includes(query)
        );
    }, [availableArtists, artistSearch]);

    const filteredAvailableVendors = useMemo(() => {
        const query = vendorSearch.trim().toLowerCase();
        if (!query) {
            return availableVendors;
        }

        return availableVendors.filter((vendor) =>
            [vendor.name, vendor.city ?? '', vendor.type ?? ''].join(' ').toLowerCase().includes(query)
        );
    }, [availableVendors, vendorSearch]);

    const filteredAvailablePromoters = useMemo(() => {
        const query = promoterSearch.trim().toLowerCase();
        if (!query) {
            return availablePromoters;
        }

        return availablePromoters.filter((promoter) =>
            [promoter.name, promoter.email ?? ''].join(' ').toLowerCase().includes(query)
        );
    }, [availablePromoters, promoterSearch]);

    function saveLinks(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        linksForm.put(`/events/${event.slug}`, { preserveScroll: true, forceFormData: true });
    }

    function getCookie(name: string): string {
        if (typeof document === 'undefined') return '';
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() ?? '';
        return '';
    }

    async function addToCart(ticket: { id: number; price: number }): Promise<boolean> {
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const xsrf = decodeURIComponent(getCookie('XSRF-TOKEN') || '');
            const csrfToken = token || xsrf;
            const resp = await fetch('/cart/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                    ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
                },
                credentials: 'include',
                body: JSON.stringify({
                    ticket_id: ticket.id,
                    event_id: event.id,
                    quantity: 1,
                    price: ticket.price,
                    _token: csrfToken,
                }),
            });

            if (resp.ok) {
                // notify sidebar to refresh
                window.dispatchEvent(new CustomEvent('cart:updated'));
                return true;
            } else {
                console.error('Failed to add to cart', resp.statusText);
            }
        } catch (e) {
            console.error('Add to cart error', e);
        }
        return false;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={event.title}>
                {[
                    <meta key="description" name="description" content={event.description || ''} />,
                    <meta key="og:title" property="og:title" content={event.title} />,
                    <meta key="og:description" property="og:description" content={event.description || ''} />,
                    event.image || event.image_thumbnail ? (
                        <meta key="og:image" property="og:image" content={event.image ? `/storage/${event.image}` : `/storage/${event.image_thumbnail}`} />
                    ) : null,
                    <script
                        key="ldjson"
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Event',
                            name: event.title || undefined,
                            description: event.description || undefined,
                            startDate: event.start_at ? event.start_at.slice(0, 10) : undefined,
                            endDate: event.end_at ? event.end_at.slice(0, 10) : undefined,
                            url: typeof window !== 'undefined' ? window.location.href : undefined,
                            image: event.image ? `${window.location.origin}/storage/${event.image}` : (event.image_thumbnail ? `${window.location.origin}/storage/${event.image_thumbnail}` : undefined),
                            location: {
                                '@type': 'Place',
                                name: event.address || event.city || event.country || undefined,
                                address: event.address || (event.city || event.country ? `${event.city || ''}${event.city && event.country ? ', ' : ''}${event.country || ''}` : undefined),
                            },
                            organizer: current && event.organisers ? event.organisers.map((o: Organiser) => ({ '@type': 'Organization', name: o.name })) : undefined,
                        }) }}
                    />,
                ]}
            </Head>

            <div className={showHomeHeader ? 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8' : 'p-4'}>
                <div className="mb-3">
                    <button type="button" className="btn-secondary" onClick={() => window.history.back()} aria-label="Go back" title="Go back">
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                </div>
                {(() => {
                    const toStorageUrl = (path: string) => {
                        if (path.startsWith('http')) return path;
                        if (path.startsWith('/storage/')) return path;
                        if (path.startsWith('storage/')) return `/${path}`;
                        return `/storage/${path}`;
                    };

                    const thumbnailPath = event.image_thumbnail_url ?? event.image_thumbnail ?? '';
                    const fullImagePath = event.image_url ?? event.image ?? '';
                    const publicPath = event.image_url ?? event.image ?? event.image_thumbnail_url ?? event.image_thumbnail ?? '';

                    const selectedPath = page.props?.canEdit
                        ? (thumbnailPath || fullImagePath)
                        : publicPath;

                    let url = '/images/default-event.svg';
                    if (selectedPath) {
                        url = toStorageUrl(selectedPath);
                    }

                    const ts = (event.updated_at ?? event.created_at) as string | undefined;
                    const addCacheBust = (u: string, t?: string) => {
                        if (!t) return u;
                        const sep = u.includes('?') ? '&' : '?';
                        return `${u}${sep}v=${encodeURIComponent(t)}`;
                    };
                    const finalUrl = addCacheBust(url, ts);
                    const fullImageUrl = fullImagePath ? addCacheBust(toStorageUrl(fullImagePath), ts) : null;

                    const imageElement = (
                        <img src={finalUrl} alt={event.title} className="max-h-[500px] max-w-full h-auto w-auto rounded mx-auto" />
                    );

                    return (
                        <div className="mb-4">
                            {page.props?.canEdit && fullImageUrl ? (
                                <a href={fullImageUrl} target="_blank" rel="noreferrer" title="Open full image">
                                    {imageElement}
                                </a>
                            ) : imageElement}
                        </div>
                    );
                })()}

                {page.props?.tickets && page.props.tickets.length > 0 && (
                    <div id="tickets" className="mt-3 mb-4">
                        <div className="mt-2 space-y-2">
                            {page.props.tickets.map((t: { id: number; name: string; price: number; quantity_total: number; quantity_available: number; active: boolean }) => (
                                <div
                                    key={t.id}
                                    className="box cursor-default hover:bg-[#eef2f7] hover:shadow-[0_14px_32px_rgba(7,8,10,0.18)]"
                                >
                                    {page.props?.canEdit ? (
                                                <TicketItem eventSlug={event.slug} ticket={t} />
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">{t.name}</div>
                                                        <div className="text-sm text-muted">{t.quantity_available} / {t.quantity_total} available · Sold: {t.quantity_total - t.quantity_available}</div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="font-medium">€{t.price.toFixed(2)}</div>
                                                        {t.active && t.quantity_available > 0 ? (
                                                            <div className="flex items-center gap-2">
                                                                <ActionButton onClick={() => addToCart(t)}>
                                                                    Add to cart
                                                                </ActionButton>
                                                                <ActionButton onClick={async () => { const ok = await addToCart(t); if (ok) { window.location.href = '/cart'; } else { alert('Could not add ticket to cart. Please try again.'); } }}>
                                                                    Buy Now
                                                                </ActionButton>
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-muted">Sold out</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                </div>
                            ))}
                        </div>
                        {!page.props.canEdit && page.props.tickets.every((t: { active: boolean; quantity_available: number; quantity_total: number }) => !t.active || t.quantity_available < 1) && (
                            <div className="mt-3 rounded border border-dashed border-border bg-muted/40 p-3 text-sm text-muted">
                                No tickets are currently available for this event.
                            </div>
                        )}
                    </div>
                )}

                {(!page.props?.tickets || page.props.tickets.length === 0) && !page.props?.canEdit && (
                    <div className="mt-3 mb-4 rounded border border-dashed border-border bg-muted/40 p-3 text-sm text-muted">
                        No tickets are currently available for this event.
                    </div>
                )}

                <h1 className="text-2xl font-semibold">{event.title}</h1>

                <div className="text-sm text-muted">
                    {event.city ? event.city : ''}{event.city && event.country ? ', ' : ''}{event.country ? event.country : ''}
                </div>

                {/* address intentionally not displayed in public pages */}

                <div className="text-sm text-muted mt-2">
                    {event.start_at ? `Starts: ${new Date(event.start_at).toLocaleDateString()}` : 'Starts: —'}
                    {event.end_at ? ` · Ends: ${new Date(event.end_at).toLocaleDateString()}` : ''}
                </div>

                {current && (
                    <div className="text-sm text-muted mt-2">Status: {event.active ? 'Active' : 'Inactive'}</div>
                )}

                {event.organisers && event.organisers.length > 0 && (
                    current ? (
                        <div className="text-sm text-muted mt-2">Organisers: {event.organisers.map((o: Organiser) => o.name).join(', ')}</div>
                    ) : (
                        <OrganiserPlaceholder />
                    )
                )}

                {(artists.length > 0 || page.props?.canEdit) && (
                    <div className="mt-2">
                        <div className="text-sm text-muted">Artists:</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {artists.map((a) => (
                                <div key={a.id} className="flex items-center gap-2 rounded border px-2 py-1 text-sm">
                                    {a.photo_url ? (
                                        <img src={a.photo_url} alt={a.name} className="h-6 w-6 rounded-full object-cover" />
                                    ) : null}
                                    <span className="font-medium">{a.name}</span>
                                    {a.city ? <span className="text-muted">· {a.city}</span> : null}
                                </div>
                            ))}
                            {artists.length === 0 && page.props?.canEdit ? <div className="text-sm text-muted">No artists linked yet.</div> : null}
                        </div>
                    </div>
                )}

                {(vendors.length > 0 || page.props?.canEdit) && (
                    <div className="mt-2">
                        <div className="text-sm text-muted">Vendors:</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {vendors.map((v) => (
                                <div key={v.id} className="flex items-center gap-2 rounded border px-2 py-1 text-sm">
                                    <span className="font-medium">{v.name}</span>
                                    {v.type ? <span className="text-muted">· {v.type}</span> : null}
                                    {v.city ? <span className="text-muted">· {v.city}</span> : null}
                                </div>
                            ))}
                            {vendors.length === 0 && page.props?.canEdit ? <div className="text-sm text-muted">No vendors linked yet.</div> : null}
                        </div>
                    </div>
                )}

                {(promoters.length > 0 || page.props?.canEdit) && (
                    <div className="mt-2">
                        <div className="text-sm text-muted">Promoters:</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {promoters.map((promoter) => (
                                <div key={promoter.id} className="flex items-center gap-2 rounded border px-2 py-1 text-sm">
                                    <span className="font-medium">{promoter.name}</span>
                                    {promoter.email ? <span className="text-muted">· {promoter.email}</span> : null}
                                </div>
                            ))}
                            {promoters.length === 0 && page.props?.canEdit ? <div className="text-sm text-muted">No promoters linked yet.</div> : null}
                        </div>
                    </div>
                )}

                {page.props?.canEdit && (
                    <div className="mt-2">
                        <div className="text-sm text-muted">Ticket controllers:</div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                ticketControllerForm.post(`/events/${event.slug}/ticket-controllers`, {
                                    preserveScroll: true,
                                    onSuccess: () => ticketControllerForm.reset('email'),
                                });
                            }}
                            className="mt-2 flex flex-col gap-2 md:flex-row md:items-center"
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

                        <div className="mt-2 flex flex-wrap gap-2">
                            {ticketControllers.map((ticketController) => (
                                <div key={ticketController.id} className="flex items-center gap-2 rounded border px-2 py-1 text-sm">
                                    <span className="font-medium">{ticketController.email}</span>
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => router.delete(`/events/${event.slug}/ticket-controllers/${ticketController.id}`, { preserveScroll: true })}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            {ticketControllers.length === 0 ? <div className="text-sm text-muted">No ticket controllers added yet.</div> : null}
                        </div>
                    </div>
                )}

                {page.props?.canEdit && availableArtists.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                        <h3 className="text-sm font-medium">Booking requests</h3>
                        <div className="mt-2 rounded border border-border bg-muted/20 p-3">
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
                                        onChange={(e) => bookingForm.setData('artist_id', e.target.value)}
                                    >
                                        <option value="">Select artist</option>
                                        {availableArtists.map((artist) => (
                                            <option key={artist.id} value={String(artist.id)}>{artist.name}{artist.city ? ` (${artist.city})` : ''}</option>
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
                                        onChange={(e) => bookingForm.setData('message', e.target.value)}
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
                    </div>
                )}

                {page.props?.canEdit && availableVendors.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                        <h3 className="text-sm font-medium">Vendor booking requests</h3>
                        <div className="mt-2 rounded border border-border bg-muted/20 p-3">
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
                                        onChange={(e) => vendorBookingForm.setData('vendor_id', e.target.value)}
                                    >
                                        <option value="">Select vendor</option>
                                        {availableVendors.map((vendor) => (
                                            <option key={vendor.id} value={String(vendor.id)}>{vendor.name}{vendor.type ? ` (${vendor.type})` : ''}{vendor.city ? ` · ${vendor.city}` : ''}</option>
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
                                        onChange={(e) => vendorBookingForm.setData('message', e.target.value)}
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
                    </div>
                )}

                <div
                    className="mt-4"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description ?? '') }}
                />

                {page.props?.canEdit && (
                    <div className="mt-4 border-t pt-4">
                        <h3 className="text-sm font-medium">Create ticket type</h3>
                        <TicketCreateForm eventSlug={event.slug} />
                    </div>
                )}

                {current && (
                    <div className="mt-4 text-xs text-muted">
                        <div>Created by: {event.user ? (event.user.name ?? event.user.email) : '—'}</div>
                        <div>Created: {event.created_at ? new Date(event.created_at).toLocaleString() : '—'}</div>
                        <div>Updated: {event.updated_at ? new Date(event.updated_at).toLocaleString() : '—'}</div>
                    </div>
                )}

                <div className="mt-6">
                    <div className="flex items-center gap-3">
                        {page.props?.canEdit ? (
                            <ActionIcon href={`/events/${event.slug}/edit`} aria-label="Edit event" title="Edit event"><Pencil className="h-4 w-4" /></ActionIcon>
                        ) : null}

                        {!current && !showHomeHeader && null}
                    </div>

                    {page.props?.canEdit && (
                        <form onSubmit={saveLinks} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Main organiser</label>
                                <select
                                    className="input"
                                    required
                                    value={linksForm.data.organiser_id ?? ''}
                                    onChange={(e) => linksForm.setData('organiser_id', e.target.value ? Number(e.target.value) : null)}
                                >
                                    <option value="">Select organiser</option>
                                    {organisers.map((organiser) => (
                                        <option key={organiser.id} value={organiser.id}>{organiser.name}</option>
                                    ))}
                                </select>
                                {linksForm.errors.organiser_id && <p className="mt-1 text-sm text-red-600">{linksForm.errors.organiser_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Organisers</label>
                                <OrganiserMultiSelect organisers={organisers} value={linksForm.data.organiser_ids} onChange={(v: number[]) => linksForm.setData('organiser_ids', v)} />
                            </div>

                            <div>
                                <label htmlFor="artist_ids" className="block text-sm font-medium">Artists</label>
                                <input
                                    type="text"
                                    className="input mt-2"
                                    value={artistSearch}
                                    onChange={(e) => setArtistSearch(e.target.value)}
                                    placeholder="Search artists..."
                                />
                                <select
                                    id="artist_ids"
                                    className="input min-h-28"
                                    multiple
                                    value={linksForm.data.artist_ids.map(String)}
                                    onChange={(e) => {
                                        const values = Array.from(e.target.selectedOptions).map((option) => Number(option.value));
                                        linksForm.setData('artist_ids', values);
                                    }}
                                >
                                    {filteredAvailableArtists.map((artist) => (
                                        <option key={artist.id} value={artist.id}>{artist.name}{artist.city ? ` (${artist.city})` : ''}</option>
                                    ))}
                                </select>
                                <p className="mt-1 text-sm text-muted">Hold Ctrl (Windows) or Command (Mac) to select multiple.</p>
                                {linksForm.errors.artist_ids && <p className="mt-1 text-sm text-red-600">{linksForm.errors.artist_ids}</p>}
                            </div>

                            <div>
                                <label htmlFor="vendor_ids" className="block text-sm font-medium">Vendors</label>
                                <input
                                    type="text"
                                    className="input mt-2"
                                    value={vendorSearch}
                                    onChange={(e) => setVendorSearch(e.target.value)}
                                    placeholder="Search vendors..."
                                />
                                <select
                                    id="vendor_ids"
                                    className="input min-h-28"
                                    multiple
                                    value={linksForm.data.vendor_ids.map(String)}
                                    onChange={(e) => {
                                        const values = Array.from(e.target.selectedOptions).map((option) => Number(option.value));
                                        linksForm.setData('vendor_ids', values);
                                    }}
                                >
                                    {filteredAvailableVendors.map((vendor) => (
                                        <option key={vendor.id} value={vendor.id}>{vendor.name}{vendor.type ? ` (${vendor.type})` : ''}{vendor.city ? ` · ${vendor.city}` : ''}</option>
                                    ))}
                                </select>
                                <p className="mt-1 text-sm text-muted">Hold Ctrl (Windows) or Command (Mac) to select multiple.</p>
                                {linksForm.errors.vendor_ids && <p className="mt-1 text-sm text-red-600">{linksForm.errors.vendor_ids}</p>}
                            </div>

                            <div>
                                <label htmlFor="promoter_ids" className="block text-sm font-medium">Promoters</label>
                                <input
                                    type="text"
                                    className="input mt-2"
                                    value={promoterSearch}
                                    onChange={(e) => setPromoterSearch(e.target.value)}
                                    placeholder="Search promoters..."
                                />
                                <select
                                    id="promoter_ids"
                                    className="input min-h-28"
                                    multiple
                                    value={linksForm.data.promoter_ids.map(String)}
                                    onChange={(e) => {
                                        const values = Array.from(e.target.selectedOptions).map((option) => Number(option.value));
                                        linksForm.setData('promoter_ids', values);
                                    }}
                                >
                                    {filteredAvailablePromoters.map((promoter) => (
                                        <option key={promoter.id} value={promoter.id}>{promoter.name}{promoter.email ? ` (${promoter.email})` : ''}</option>
                                    ))}
                                </select>
                                <p className="mt-1 text-sm text-muted">Hold Ctrl (Windows) or Command (Mac) to select multiple.</p>
                                {linksForm.errors.promoter_ids && <p className="mt-1 text-sm text-red-600">{linksForm.errors.promoter_ids}</p>}
                            </div>

                            <div>
                                <button type="submit" className="btn-primary" disabled={linksForm.processing}>Save linked people</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

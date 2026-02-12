import { Head, useForm, usePage } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import type { FormEvent } from 'react';
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
    image_thumbnail?: string | null;
    active?: boolean;
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

    // debug logging removed

    const organisersForm = useForm({ organiser_ids: event.organisers ? event.organisers.map((o: Organiser) => o.id) : [] });

    function saveOrganisers(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        organisersForm.put(`/events/${event.slug}`, { forceFormData: true });
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
                {(() => {
                    const p = event.image_url ?? event.image_thumbnail_url ?? event.image ?? event.image_thumbnail ?? '';
                    let url = '/images/default-event.svg';
                    if (p) {
                        if (p.startsWith('http')) url = p;
                        else if (p.startsWith('/storage/')) url = p;
                        else if (p.startsWith('storage/')) url = `/${p}`;
                        else url = `/storage/${p}`;
                    }
                    const ts = (event.updated_at ?? event.created_at) as string | undefined;
                    const addCacheBust = (u: string, t?: string) => {
                        if (!t) return u;
                        const sep = u.includes('?') ? '&' : '?';
                        return `${u}${sep}v=${encodeURIComponent(t)}`;
                    };
                    const finalUrl = addCacheBust(url, ts);
                    return (
                        <div className="mb-4">
                            <img src={finalUrl} alt={event.title} className="max-h-[500px] max-w-full h-auto w-auto rounded mx-auto" />
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

                {artists.length > 0 && (
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
                        </div>
                    </div>
                )}

                {vendors.length > 0 && (
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
                            <ActionButton href={`/events/${event.slug}/edit`}>Edit</ActionButton>
                        ) : null}

                        {!current && !showHomeHeader && null}
                    </div>

                    {page.props?.canEdit && (
                        <form onSubmit={saveOrganisers} className="mt-4">
                            <label className="block text-sm font-medium mb-2">Organisers</label>
                            <OrganiserMultiSelect organisers={organisers} value={organisersForm.data.organiser_ids} onChange={(v: number[]) => organisersForm.setData('organiser_ids', v)} />
                            <div className="mt-2">
                                <button type="submit" className="btn-primary" disabled={organisersForm.processing}>Save organisers</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

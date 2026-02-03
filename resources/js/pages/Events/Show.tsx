import { Head, Link, usePage, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import OrganiserMultiSelect from '@/components/organiser-multi-select';
import OrganiserPlaceholder from '@/components/organiser-placeholder';
import TicketCreateForm from '@/components/TicketCreateForm';
import TicketItem from '@/components/TicketItem';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Organiser = { id: number; name: string };

type Event = {
    id: number;
    title: string;
    description?: string | null;
    location?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
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
        { title: event.title, href: `/events/${event.id}` },
    ];
    const page = usePage();
    const current = page.props?.auth?.user;
    const showHomeHeader = page.props?.showHomeHeader ?? false;
    const organisers = page.props?.organisers ?? [] as Organiser[];

    // debug logging removed

    const organisersForm = useForm({ organiser_ids: event.organisers ? event.organisers.map((o: Organiser) => o.id) : [] });

    function saveOrganisers(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        organisersForm.put(`/events/${event.id}`, { forceFormData: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head>
                <title>{event.title}</title>
                <meta name="description" content={event.description || ''} />
                <meta property="og:title" content={event.title} />
                <meta property="og:description" content={event.description || ''} />
                {event.image || event.image_thumbnail ? (
                    <meta property="og:image" content={event.image ? `/storage/${event.image}` : `/storage/${event.image_thumbnail}`} />
                ) : null}
                {/* JSON-LD structured data for Event (omit organisers for guests) */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Event',
                        name: event.title || undefined,
                        description: event.description || undefined,
                        startDate: event.start_at || undefined,
                        endDate: event.end_at || undefined,
                        url: typeof window !== 'undefined' ? window.location.href : undefined,
                        image: event.image ? `${window.location.origin}/storage/${event.image}` : (event.image_thumbnail ? `${window.location.origin}/storage/${event.image_thumbnail}` : undefined),
                        location: {
                            '@type': 'Place',
                            name: event.location || undefined,
                            address: event.address || (event.city || event.country ? `${event.city || ''}${event.city && event.country ? ', ' : ''}${event.country || ''}` : undefined),
                        },
                        organizer: current && event.organisers ? event.organisers.map((o: Organiser) => ({ '@type': 'Organization', name: o.name })) : undefined,
                    }) }}
                />
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
                            <img src={finalUrl} alt={event.title} className="max-w-full h-auto rounded" />
                        </div>
                    );
                })()}
                <h1 className="text-2xl font-semibold">{event.title}</h1>

                <div className="text-sm text-muted">
                    {event.location}{event.city ? ` · ${event.city}` : ''}{event.country ? `, ${event.country}` : ''}
                </div>

                {/* address intentionally not displayed in public pages */}

                <div className="text-sm text-muted mt-2">
                    {event.start_at ? `Starts: ${new Date(event.start_at).toLocaleString()}` : 'Starts: —'}
                    {event.end_at ? ` · Ends: ${new Date(event.end_at).toLocaleString()}` : ''}
                </div>

                <div className="text-sm text-muted mt-2">Status: {event.active ? 'Active' : 'Inactive'}</div>

                {event.organisers && event.organisers.length > 0 && (
                    current ? (
                        <div className="text-sm text-muted mt-2">Organisers: {event.organisers.map((o: Organiser) => o.name).join(', ')}</div>
                    ) : (
                        <OrganiserPlaceholder />
                    )
                )}

                <div className="mt-4">{event.description}</div>

                {page.props?.tickets && page.props.tickets.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold">Tickets</h2>
                        <div className="mt-2 space-y-2">
                            {page.props.tickets.map((t: { id: number; name: string; price: number; quantity_total: number; quantity_available: number; active: boolean }) => (
                                <div key={t.id} className="border p-2 rounded">
                                    {page.props?.canEdit ? (
                                        <TicketItem eventId={event.id} ticket={t} />
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{t.name}</div>
                                                <div className="text-sm text-muted">{t.quantity_available} / {t.quantity_total} available</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">${t.price.toFixed(2)}</div>
                                                {t.active && t.quantity_available > 0 ? (
                                                    <button className="btn mt-2">Buy</button>
                                                ) : (
                                                    <div className="text-xs text-muted mt-2">Sold out</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {page.props?.canEdit && (
                    <div className="mt-4 border-t pt-4">
                        <h3 className="text-sm font-medium">Create ticket</h3>
                        <TicketCreateForm eventId={event.id} />
                    </div>
                )}

                <div className="mt-4 text-xs text-muted">
                    <div>Created by: {event.user ? (event.user.name ?? event.user.email) : '—'}</div>
                    <div>Created: {event.created_at ? new Date(event.created_at).toLocaleString() : '—'}</div>
                    <div>Updated: {event.updated_at ? new Date(event.updated_at).toLocaleString() : '—'}</div>
                </div>

                <div className="mt-6">
                    <div className="flex items-center gap-3">
                        {page.props?.canEdit ? (
                            <Link href={`/events/${event.id}/edit`} className="btn">Edit</Link>
                        ) : null}

                        {!current && !showHomeHeader && (
                            <div className="ml-auto text-sm">
                                <Link href="/login" className="text-blue-600 mr-3">Log in</Link>
                                <Link href="/register" className="text-blue-600">Sign up</Link>
                            </div>
                        )}
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

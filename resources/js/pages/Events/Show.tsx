import { Head, Link, usePage, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import PublicHeader from '@/components/public-header';
import type { BreadcrumbItem } from '@/types';
import OrganiserMultiSelect from '@/components/organiser-multi-select';

type Props = { event: any };

export default function Show({ event }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Events', href: '/events' },
        { title: event.title, href: `/events/${event.id}` },
    ];
    const page = usePage();
    const current = page.props?.auth?.user;
    const showHomeHeader = page.props?.showHomeHeader ?? false;
    const organisers = page.props?.organisers ?? [];

    const organisersForm = useForm({ organiser_ids: event.organisers ? event.organisers.map((o: any) => o.id) : [] });

    function saveOrganisers(e: any) {
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
                {event.image_thumbnail || event.image ? (
                    <meta property="og:image" content={event.image_thumbnail ? `/storage/${event.image_thumbnail}` : `/storage/${event.image}`} />
                ) : null}

                {/* JSON-LD structured data for Event */}
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
                        image: event.image_thumbnail ? `${window.location.origin}/storage/${event.image_thumbnail}` : (event.image ? `${window.location.origin}/storage/${event.image}` : undefined),
                        location: {
                            '@type': 'Place',
                            name: event.location || undefined,
                            address: event.address || (event.city || event.country ? `${event.city || ''}${event.city && event.country ? ', ' : ''}${event.country || ''}` : undefined),
                        },
                        organizer: event.organisers ? event.organisers.map((o: any) => ({ '@type': 'Organization', name: o.name })) : undefined,
                    }) }}
                />
            </Head>

            {showHomeHeader && <PublicHeader />}

            <div className={showHomeHeader ? 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8' : 'p-4'}>
                {(() => {
                    const url = event.image_thumbnail ? `/storage/${event.image_thumbnail}` : (event.image ? `/storage/${event.image}` : '/images/default-event.svg');
                    return (
                        <div className="mb-4">
                            <img src={url} alt={event.title} className="max-w-full h-auto rounded" />
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
                    <div className="text-sm text-muted mt-2">Organisers: {event.organisers.map((o: any) => o.name).join(', ')}</div>
                )}

                <div className="mt-4">{event.description}</div>

                <div className="mt-4 text-xs text-muted">
                    <div>Created by: {event.user ? (event.user.name ?? event.user.email) : '—'}</div>
                    <div>Created: {event.created_at ? new Date(event.created_at).toLocaleString() : '—'}</div>
                    <div>Updated: {event.updated_at ? new Date(event.updated_at).toLocaleString() : '—'}</div>
                </div>

                <div className="mt-6">
                    <div className="flex items-center gap-3">
                        <Link href={`/events/${event.id}/edit`} className="btn">Edit</Link>

                        {!current && !showHomeHeader && (
                            <div className="ml-auto text-sm">
                                <Link href="/login" className="text-blue-600 mr-3">Log in</Link>
                                <Link href="/register" className="text-blue-600">Sign up</Link>
                            </div>
                        )}
                    </div>

                    {(current && (current.is_super_admin || (event.user && current.id === event.user.id))) && (
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

import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import PublicHeader from '@/components/public-header';
import type { BreadcrumbItem } from '@/types';

type Props = {
    events: any;
    showHomeHeader?: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Events', href: '/events' },
];

export default function EventsIndex({ events }: Props) {
    const page = usePage();
    const current = page.props?.auth?.user;
    const showHomeHeader = page.props?.showHomeHeader ?? false;
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const activeFilter = params?.get('active') ?? 'all';
    const sort = params?.get('sort') ?? '';
    const cityFilter = params?.get('city') ?? '';
    const countryFilter = params?.get('country') ?? '';
    const cities: string[] = page.props?.cities ?? [];
    const countries: string[] = page.props?.countries ?? [];

    function applyFilters(updates: Record<string, string | null>) {
        if (typeof window === 'undefined') return;
        const sp = new URLSearchParams(window.location.search);
        Object.entries(updates).forEach(([k, v]) => {
            if (v === null || v === '') {
                sp.delete(k);
            } else {
                sp.set(k, v);
            }
        });
        const q = sp.toString();
        router.get(`/events${q ? `?${q}` : ''}`);
    }

    function toggleActive(eventId: number, value: boolean) {
        router.put(`/events/${eventId}`, { active: value });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head>
                <title>Events</title>
                <meta name="description" content="Browse upcoming events." />
            </Head>

            {showHomeHeader && <PublicHeader />}

            <div className={showHomeHeader ? 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8' : 'p-4'}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">

                        {!showHomeHeader && (
                            <select value={activeFilter} onChange={e => applyFilters({ active: e.target.value === 'all' ? null : e.target.value })} className="input">
                                <option value="all">All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        )}
                        <select value={cityFilter} onChange={e => applyFilters({ city: e.target.value || null, page: null })} className="input">
                            <option value="">All cities</option>
                            {cities.map((c: string) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <select value={countryFilter} onChange={e => applyFilters({ country: e.target.value || null, page: null })} className="input">
                            <option value="">All countries</option>
                            {countries.map((c: string) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <select value={sort} onChange={e => applyFilters({ sort: e.target.value || null, page: null })} className="input">
                            <option value="">Sort: Latest</option>
                            <option value="start_asc">Sort: Start (soonest)</option>
                            <option value="start_desc">Sort: Start (latest)</option>
                            <option value="created_desc">Sort: Newest</option>
                            <option value="title_asc">Sort: Title (A–Z)</option>
                        </select>
                    </div>
                    {current ? (
                        <Link href="/events/create" className="btn-primary">New Event</Link>
                    ) : (
                        !showHomeHeader ? (
                            <div className="text-sm">
                                <Link href="/login" className="text-blue-600 mr-3">Log in</Link>
                                <Link href="/register" className="text-blue-600">Sign up</Link>
                            </div>
                        ) : null
                    )}
                </div>

                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            {events.links?.map((link: any) => (
                                link.url ? (
                                    <Link
                                        key={link.label}
                                        href={link.url}
                                        className={link.active ? 'font-medium px-2' : 'text-muted px-2'}
                                        as="a"
                                        preserveScroll
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Link>
                                ) : (
                                    <span key={link.label} className="px-2" dangerouslySetInnerHTML={{ __html: link.label }} />
                                )
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <select value={cityFilter} onChange={e => applyFilters({ city: e.target.value || null, page: null })} className="input">
                                <option value="">All cities</option>
                                {cities.map((c: string) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <select value={countryFilter} onChange={e => applyFilters({ country: e.target.value || null, page: null })} className="input">
                                <option value="">All countries</option>
                                {countries.map((c: string) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <select value={sort} onChange={e => applyFilters({ sort: e.target.value || null, page: null })} className="input">
                                <option value="">Sort: Latest</option>
                                <option value="start_asc">Sort: Start (soonest)</option>
                                <option value="start_desc">Sort: Start (latest)</option>
                                <option value="created_desc">Sort: Newest</option>
                                <option value="title_asc">Sort: Title (A–Z)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-3">
                    {events.data?.map((event: any) => (
                        <div key={event.id} className="border rounded p-3">
                            <div className="flex justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-20 h-12 flex-shrink-0">
                                        <img
                                            src={event.image_thumbnail ? `/storage/${event.image_thumbnail}` : (event.image ? `/storage/${event.image}` : '/images/default-event.svg')}
                                            alt={event.title}
                                            className="w-full h-full object-cover rounded"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/events/${event.id}`} className="text-lg font-medium">{event.title}</Link>
                                            {!event.active && (
                                                <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">Inactive</span>
                                            )}
                                        </div>

                                        <div className="text-sm text-muted">{event.location}{event.city ? ` · ${event.city}` : ''}{event.country ? `, ${event.country}` : ''}</div>

                                        <div className="text-sm text-muted mt-1">
                                            {event.start_at ? `Starts: ${new Date(event.start_at).toLocaleString()}` : 'Starts: —'}
                                            {event.end_at ? ` · Ends: ${new Date(event.end_at).toLocaleString()}` : ''}
                                        </div>

                                        {event.organisers && event.organisers.length > 0 && (
                                            <div className="text-sm text-muted mt-1">
                                                Organisers: {event.organisers.map((o: any, idx: number) => (
                                                    <span key={o.id}>
                                                        {current ? (
                                                            <Link href={`/organisers/${o.id}`} className="text-blue-600">{o.name}</Link>
                                                        ) : (
                                                            <span>{o.name}</span>
                                                        )}
                                                        {idx < event.organisers.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center">
                                    {current && (current.is_super_admin || (event.user && current.id === event.user.id)) && (
                                        <label className="flex items-center mr-3">
                                            <input type="checkbox" checked={!!event.active} onChange={e => toggleActive(event.id, e.target.checked)} />
                                            <span className="ml-2 text-sm text-muted">Active</span>
                                        </label>
                                    )}

                                    <div className="flex gap-2">
                                        <Link href={`/events/${event.id}/edit`} className="text-sm text-blue-600">Edit</Link>
                                        <form action={`/events/${event.id}`} method="post" className="inline">
                                            <input type="hidden" name="_method" value="delete" />
                                            <button className="text-sm text-red-600" type="submit">Delete</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    {events.links?.map((link: any) => (
                        link.url ? (
                            <Link
                                key={link.label}
                                href={link.url}
                                className={link.active ? 'font-medium px-2' : 'text-muted px-2'}
                                as="a"
                                preserveScroll
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Link>
                        ) : (
                            <span key={link.label} className="px-2" dangerouslySetInnerHTML={{ __html: link.label }} />
                        )
                    ))}
                </div>
                </div>
            </div>
        </AppLayout>
    );
}

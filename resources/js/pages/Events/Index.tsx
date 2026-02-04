import { Head, Link, usePage, router } from '@inertiajs/react';
import ActionButton from '@/components/ActionButton';
import { useEffect, useRef, useState } from 'react';
import ListControls from '@/components/list-controls';
import OrganiserPlaceholder from '@/components/organiser-placeholder';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Organiser = {
    id: number;
    name: string;
};

type Event = {
    id: number;
    title: string;
    location?: string | null;
    image?: string | null;
    image_thumbnail?: string | null;
    active?: boolean;
    organisers?: Organiser[];
    user?: { id: number } | null;
    country?: string | null;
    city?: string | null;
    start_at?: string | null;
};

type PaginationLink = {
    label?: string | null;
    url?: string | null;
    active?: boolean;
};

type EventsPagination = {
    data: Event[];
    links?: PaginationLink[];
};

type Props = {
    events: EventsPagination;
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

    function applySort(key: string) {
        if (typeof window === 'undefined') return;
        const sp = new URLSearchParams(window.location.search);
        const current = sp.get('sort') ?? '';
        // Toggle between asc and desc for clarity (no third 'none' state)
        let next = '';
        if (current === `${key}_asc`) next = `${key}_desc`;
        else next = `${key}_asc`;
        sp.set('sort', next);
        sp.delete('page');
        router.get(`/events${sp.toString() ? `?${sp.toString()}` : ''}`);
    }

    function toggleActive(eventId: number, value: boolean) {
        router.put(`/events/${eventId}/active`, { active: value });
    }

    const initial = params?.get('q') ?? '';
    const [search, setSearch] = useState(initial);
    const timeoutRef = useRef<number | null>(null);
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        const delay = 300;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
            const qs = new URLSearchParams(window.location.search);
            if (search) qs.set('q', search); else qs.delete('q');
            router.get(`/events${qs.toString() ? `?${qs.toString()}` : ''}`);
        }, delay);
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, [search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head>
                <title>Events</title>
                <meta name="description" content="Browse upcoming events." />
            </Head>

            <div className={showHomeHeader ? 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8' : 'p-4'}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        {/* top filters removed (kept in pagination area) */}
                    </div>
                    {!current && !showHomeHeader ? (
                        <div className="text-sm">
                            <Link href="/login" className="text-blue-600 mr-3">Log in</Link>
                            <Link href="/register" className="text-blue-600">Sign up</Link>
                        </div>
                    ) : null}
                </div>

                <div className="mb-4 flex items-center justify-between">
                    <ListControls path="/events" links={events.links} showSearch={false} />
                    {current ? (
                        <ActionButton href="/events/create">New Event</ActionButton>
                    ) : null}
                </div>

                <div>
                    <div className="hidden md:grid md:grid-cols-12 gap-4 p-3 text-sm text-muted">
                        <div className="md:col-span-6 flex items-center justify-between">
                            <button
                                onClick={() => applySort('title')}
                                className="text-left text-white bg-black px-3 py-2 rounded cursor-pointer"
                                aria-sort={params?.get('sort') === 'title_asc' ? 'ascending' : params?.get('sort') === 'title_desc' ? 'descending' : 'none'}
                                aria-label="Sort by title"
                            >
                                Event
                                <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('title_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                            </button>
                            <div className="flex-1">
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search events..."
                                    className="w-full max-w-[60rem] border-2 border-gray-800 px-3 py-1"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => applySort('country')}
                            className="md:col-span-1 text-center cursor-pointer bg-black text-white px-3 py-2 rounded"
                            aria-sort={params?.get('sort') === 'country_asc' ? 'ascending' : params?.get('sort') === 'country_desc' ? 'descending' : 'none'}
                        >
                            Country
                            <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('country_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>
                        <button
                            onClick={() => applySort('city')}
                            className="md:col-span-1 text-center cursor-pointer bg-black text-white px-3 py-2 rounded"
                            aria-sort={params?.get('sort') === 'city_asc' ? 'ascending' : params?.get('sort') === 'city_desc' ? 'descending' : 'none'}
                        >
                            City
                            <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('city_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>
                        <button
                            onClick={() => applySort('start')}
                            className="md:col-span-1 text-center cursor-pointer bg-black text-white px-3 py-2 rounded"
                            aria-sort={params?.get('sort') === 'start_asc' ? 'ascending' : params?.get('sort') === 'start_desc' ? 'descending' : 'none'}
                        >
                            Start
                            <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('start_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>

                        <button
                            onClick={() => applySort('active')}
                            className="md:col-span-1 text-center cursor-pointer bg-black text-white px-3 py-2 rounded"
                            aria-sort={params?.get('sort') === 'active_asc' ? 'ascending' : params?.get('sort') === 'active_desc' ? 'descending' : 'none'}
                        >
                            Active
                            <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('active_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>
                        <div className="md:col-span-1 text-center">Actions</div>
                    </div>

                    <div className="space-y-3">
                    {events.data?.map((event: Event) => (
                        <div key={event.id} className="border rounded p-3">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                <div className="md:col-span-6 flex items-center gap-3">
                                    <div className="w-20 h-12 flex-shrink-0">
                                        {(() => {
                                            const p = event.image_thumbnail_url ?? event.image_url ?? event.image_thumbnail ?? event.image ?? '';
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
                                            return <img src={finalUrl} alt={event.title} className="w-full h-full object-cover rounded" />;
                                        })()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/events/${event.id}`} className="text-lg font-medium">{event.title}</Link>
                                            {!event.active && (
                                                <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">Inactive</span>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted">{event.location}</div>
                                        {event.organisers && event.organisers.length > 0 && (
                                            current ? (
                                                <div className="text-sm text-muted mt-1">
                                                    Organisers: {event.organisers.map((o: Organiser, idx: number) => (
                                                        <span key={o.id}>
                                                            <Link href={`/organisers/${o.id}`} className="text-blue-600">{o.name}</Link>
                                                            {idx < (event.organisers?.length ?? 0) - 1 ? ', ' : ''}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <OrganiserPlaceholder />
                                            )
                                        )}
                                    </div>
                                </div>

                                <div className="md:col-span-1 text-sm text-muted text-center">{event.country ?? '—'}</div>
                                <div className="md:col-span-1 text-sm text-muted text-center">{event.city ?? '—'}</div>
                                <div className="md:col-span-1 text-sm text-muted text-center">{event.start_at ? new Date(event.start_at).toLocaleDateString() : '—'}</div>

                                <div className="md:col-span-1 text-center">
                                    {current && (current.is_super_admin || (event.user && current.id === event.user.id)) ? (
                                        <button
                                            type="button"
                                            onClick={() => toggleActive(event.id, !event.active)}
                                            className="text-xl cursor-pointer mr-2"
                                            aria-pressed={event.active}
                                            aria-label={event.title + ' active toggle'}
                                        >
                                            {event.active ? '✅' : '⬜'}
                                        </button>
                                    ) : (
                                        event.active ? (
                                            <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">Active</span>
                                        ) : (
                                            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">Inactive</span>
                                        )
                                    )}

                                </div>
                                <div className="md:col-span-1 text-center">
                                    <button type="button" onClick={() => router.get(`/events/${event.id}/edit`)} className="ml-2 text-lg text-black cursor-pointer" aria-label={`Edit ${event.title}`}>✏️</button>
                                    <button type="button" onClick={() => { if (confirm('Delete this event?')) { router.delete(`/events/${event.id}`); } }} className="ml-2 text-lg text-black cursor-pointer" aria-label={`Delete ${event.title}`}>
                                        🗑️
                                    </button>
                                </div>
                                <div className="md:col-span-1 text-center">
                                    <Link href={`/events/${event.id}#tickets`} className="text-blue-600">Tickets</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    {events.links?.map((link: PaginationLink) => {
                        let label = link.label ?? '';
                        label = label.replace(/Previous/gi, '«').replace(/Next/gi, '»');
                        label = label.replace(/&laquo;|«/g, '«').replace(/&raquo;|»/g, '»').replace(/&lsaquo;|‹/g, '«').replace(/&rsaquo;|›/g, '»');
                        return link.url ? (
                            <Link
                                key={label + String(link.url)}
                                href={link.url}
                                className={link.active ? 'font-medium px-2' : 'text-muted px-2'}
                                as="a"
                                preserveScroll
                            >
                                <span dangerouslySetInnerHTML={{ __html: label }} />
                            </Link>
                        ) : (
                            <span key={label} className="px-2" dangerouslySetInnerHTML={{ __html: label }} />
                        );
                    })}
                </div>
                </div>
            </div>
        </AppLayout>
    );
}

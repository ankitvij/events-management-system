import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ListControls from '@/components/list-controls';
import AppLayout from '@/layouts/app-layout';
import type { Pagination, Event, PaginationLink } from '@/types/entities';

type Props = { events?: Pagination<Event> };

export default function GuestLanding({ events }: Props) {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
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
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
            const qs = new URLSearchParams(window.location.search);
            if (search) qs.set('q', search); else qs.delete('q');
            router.get(`${window.location.pathname}${qs.toString() ? `?${qs.toString()}` : ''}`);
        }, delay);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [search]);


    function applySort(key: string) {
        if (typeof window === 'undefined') return;
        const sp = new URLSearchParams(window.location.search);
        const cur = sp.get('sort') ?? '';
        let next = '';
        if (cur === `${key}_asc`) next = `${key}_desc`;
        else if (cur === `${key}_desc`) next = '';
        else next = `${key}_asc`;
        if (next === '') sp.delete('sort'); else sp.set('sort', next);
        sp.delete('page');
        router.get(`${window.location.pathname}${sp.toString() ? `?${sp.toString()}` : ''}`);
    }

    return (
        <AppLayout>
            <Head>
                <title>Welcome to Events</title>
                <meta name="description" content="Public landing page for guests" />
            </Head>



            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <section className="mt-16">
                    <ListControls path="/" links={events?.links} showSearch={false} showSort={false} />

                    <div className="hidden md:grid md:grid-cols-12 gap-4 p-3 text-sm">
                        <div className="md:col-span-8 flex items-center justify-between">
                            <button
                                onClick={() => applySort('title')}
                                className="text-left bg-black text-white px-3 py-2 rounded cursor-pointer"
                                aria-sort={params?.get('sort') === 'title_asc' ? 'ascending' : params?.get('sort') === 'title_desc' ? 'descending' : 'none'}
                            >
                                Event
                                <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('title_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                            </button>
                            <div>
                                <input name="q" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." className="w-96 md:w-[40rem] border-2 border-gray-800 px-3 py-1" />
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
                            Date
                            <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('start_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>

                    </div>

                    <div className="space-y-3">
                        {events?.data?.length ? (
                            events.data.map((event: Event) => (
                                <div key={event.id} className="border rounded p-3">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                        <div className="md:col-span-8 flex items-center gap-3">
                                            <div className="w-20 h-12 flex-shrink-0">
                                                <img
                                                    src={event.image_thumbnail ? `/storage/${event.image_thumbnail}` : (event.image ? `/storage/${event.image}` : '/images/default-event.svg')}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                            </div>
                                            <div>
                                                <Link href={`/events/${event.id}`} className="text-lg font-medium">{event.title}</Link>
                                                <div className="text-sm text-muted">{event.city ?? ''}{event.city && event.country ? ', ' : ''}{event.country ?? ''}</div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-1 text-sm text-muted text-center">{event.country ?? '—'}</div>
                                        <div className="md:col-span-1 text-sm text-muted text-center">{event.city ?? '—'}</div>
                                        <div className="md:col-span-1 text-sm text-muted text-center">{event.start_at ? new Date(event.start_at).toLocaleDateString() : '—'}</div>
                                        <div className="md:col-span-1 text-center">
                                            <Link href={`/events/${event.id}#tickets`} className="text-blue-600">Ticket types</Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted">No public events available.</div>
                        )}
                    </div>
                    {events?.links && (
                        <nav className="mt-6 flex items-center justify-center gap-2">
                            {events.links.map((l: PaginationLink, idx: number) => (
                                l.url ? (
                                    <Link key={idx} href={l.url} className={`px-3 py-1 rounded ${l.active ? 'bg-gray-900 text-white' : 'bg-white border'}`}>
                                        <span dangerouslySetInnerHTML={{ __html: l.label }} />
                                    </Link>
                                ) : (
                                    <span key={idx} className="px-3 py-1 rounded text-muted" dangerouslySetInnerHTML={{ __html: l.label }} />
                                )
                            ))}
                        </nav>
                    )}
                </section>
            </main>
        </AppLayout>
    );
}

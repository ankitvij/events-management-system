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
    const ticketButtonClass = 'btn-primary';

    const formatTicketRange = (event: Event): string | null => {
        const minValue = event.min_ticket_price;
        const maxValue = event.max_ticket_price;

        if (minValue === null || minValue === undefined || maxValue === null || maxValue === undefined) {
            return null;
        }

        const minNumber = Number(minValue);
        const maxNumber = Number(maxValue);

        if (Number.isNaN(minNumber) || Number.isNaN(maxNumber)) {
            return null;
        }

        return `€${minNumber.toFixed(2)}-€${maxNumber.toFixed(2)}`;
    };

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

    function visitEvent(slug?: string | null) {
        if (slug) {
            router.visit(`/${slug}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Welcome to Events">
                {[
                    <meta key="description" name="description" content="Public landing page for guests" />,
                ]}
            </Head>



            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <section className="mt-16">
                    <ListControls path="/" links={events?.links} showSearch={false} showSort={false} />

                    <div className="hidden max-[799px]:block mt-3">
                        <input
                            name="q"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search events..."
                            className="w-full border-2 border-gray-800 px-3 py-2"
                        />
                    </div>

                    <div className="hidden min-[800px]:grid min-[800px]:grid-cols-[minmax(0,1fr)_80px_80px_100px_100px] gap-4 p-3 text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                onClick={() => applySort('title')}
                                className="btn-primary text-left shrink-0"
                                aria-sort={params?.get('sort') === 'title_asc' ? 'ascending' : params?.get('sort') === 'title_desc' ? 'descending' : 'none'}
                            >
                                Event
                                <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('title_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                            </button>
                            <div className="flex-1">
                                    <input
                                        name="q"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search events..."
                                        className="w-full border-2 border-gray-800 px-3 py-1"
                                    />
                            </div>
                        </div>
                        <button
                            onClick={() => applySort('country')}
                            className="text-center cursor-pointer btn-primary px-2 py-1 whitespace-normal break-words"
                            aria-sort={params?.get('sort') === 'country_asc' ? 'ascending' : params?.get('sort') === 'country_desc' ? 'descending' : 'none'}
                        >
                            Country
                            <span className="ml-1">{params?.get('sort')?.startsWith('country_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>
                        <button
                            onClick={() => applySort('city')}
                            className="text-center cursor-pointer btn-primary px-2 py-1 whitespace-normal break-words"
                            aria-sort={params?.get('sort') === 'city_asc' ? 'ascending' : params?.get('sort') === 'city_desc' ? 'descending' : 'none'}
                        >
                            City
                            <span className="ml-1">{params?.get('sort')?.startsWith('city_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>
                        <button
                            onClick={() => applySort('start')}
                            className="text-center cursor-pointer btn-primary whitespace-nowrap"
                            aria-sort={params?.get('sort') === 'start_asc' ? 'ascending' : params?.get('sort') === 'start_desc' ? 'descending' : 'none'}
                        >
                            Date
                            <span className="ml-1">{params?.get('sort')?.startsWith('start_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>

                    </div>

                    <div className="space-y-3">
                        {events?.data?.length ? (
                            events.data.map((event: Event) => {
                                const priceRange = formatTicketRange(event);

                                return (
                                    <div
                                        key={event.id}
                                        className="border rounded p-3 cursor-pointer hover:bg-gray-50 transition max-[799px]:relative"
                                        role="link"
                                        tabIndex={0}
                                        onClick={() => visitEvent(event.slug)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                visitEvent(event.slug);
                                            }
                                        }}
                                    >
                                        <div className="grid grid-cols-1 min-[800px]:grid-cols-[minmax(0,1fr)_80px_80px_100px_100px] gap-4 items-start min-[800px]:items-center">
                                            <div className="flex flex-col sm:flex-row sm:items-start gap-3 min-w-0">
                                                <div className="w-20 h-12 flex-shrink-0 self-start">
                                                    <img
                                                        src={event.image_thumbnail ? `/storage/${event.image_thumbnail}` : (event.image ? `/storage/${event.image}` : '/images/default-event.svg')}
                                                        alt={event.title}
                                                        className="w-full h-full object-cover rounded"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-lg font-medium break-words whitespace-normal">{event.title}</div>
                                                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm min-[800px]:hidden">
                                                        <span className="text-muted">{event.country ?? '—'}</span>
                                                        <span className="text-muted">{event.city ?? '—'}</span>
                                                        <span className="text-muted">{event.start_at ? new Date(event.start_at).toLocaleDateString() : '—'}</span>
                                                        <span />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-sm text-muted text-center max-[799px]:hidden">{event.country ?? '—'}</div>
                                            <div className="text-sm text-muted text-center max-[799px]:hidden">{event.city ?? '—'}</div>
                                            <div className="text-sm text-muted text-center whitespace-nowrap max-[799px]:hidden">{event.start_at ? new Date(event.start_at).toLocaleDateString() : '—'}</div>
                                            <div className="flex flex-col items-end text-right max-[799px]:absolute max-[799px]:top-3 max-[799px]:right-3">
                                                <Link
                                                    href={`/${event.slug}#tickets`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={ticketButtonClass}
                                                >
                                                    Buy Tickets
                                                </Link>
                                                {priceRange ? (
                                                    <div className="mt-1 w-full text-center text-xs text-muted">
                                                        {priceRange}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
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

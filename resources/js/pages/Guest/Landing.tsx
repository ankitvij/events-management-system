import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import CompactPagination from '@/components/compact-pagination';
import AppLayout from '@/layouts/app-layout';
import type { Pagination, Event } from '@/types/entities';

type Props = { events?: Pagination<Event> };

export default function GuestLanding({ events }: Props) {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const initial = params?.get('q') ?? '';
    const initialCity = params?.get('city') ?? '';
    const initialCountry = params?.get('country') ?? '';
    const [search, setSearch] = useState(initial);
    const [selectedCity, setSelectedCity] = useState(initialCity);
    const [selectedCountry, setSelectedCountry] = useState(initialCountry);
    const timeoutRef = useRef<number | null>(null);
    const firstRender = useRef(true);
    const ticketButtonClass = 'btn-primary';
    const page = usePage<{ flash?: { success?: string; error?: string; newsletter_success?: string }; cities?: string[]; countries?: string[] }>();
    const cityOptions = page.props?.cities ?? [];
    const countryOptions = page.props?.countries ?? [];

    // Removed artist signup and login forms

    const newsletterForm = useForm({
        email: '',
    });

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

    const formatEventDate = (value?: string | null): string => {
        if (!value) {
            return 'Date TBD';
        }

        return new Date(value).toLocaleDateString();
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
            if (search) {
                qs.set('q', search);
            } else {
                qs.delete('q');
            }

            if (selectedCity) {
                qs.set('city', selectedCity);
            } else {
                qs.delete('city');
            }

            if (selectedCountry) {
                qs.set('country', selectedCountry);
            } else {
                qs.delete('country');
            }

            qs.delete('page');

            router.get(`${window.location.pathname}${qs.toString() ? `?${qs.toString()}` : ''}`);
        }, delay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [search, selectedCity, selectedCountry]);

    function resetFilters() {
        setSearch('');
        setSelectedCity('');
        setSelectedCountry('');

        if (typeof window === 'undefined') {
            return;
        }

        const sp = new URLSearchParams(window.location.search);
        sp.delete('q');
        sp.delete('city');
        sp.delete('country');
        sp.delete('sort');
        sp.delete('page');
        router.get(`${window.location.pathname}${sp.toString() ? `?${sp.toString()}` : ''}`);
    }

    function applySort(key: string) {
        if (typeof window === 'undefined') {
            return;
        }

        const sp = new URLSearchParams(window.location.search);
        const cur = sp.get('sort') ?? '';
        let next = '';

        if (cur === `${key}_asc`) {
            next = `${key}_desc`;
        } else if (cur === `${key}_desc`) {
            next = '';
        } else {
            next = `${key}_asc`;
        }

        if (next === '') {
            sp.delete('sort');
        } else {
            sp.set('sort', next);
        }

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

            <main className="w-full">
                <div className="min-w-0 flex-1">
                <section className="mt-6">
                    <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                        <select
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className="input w-full sm:w-56"
                            aria-label="Filter by country"
                        >
                            <option value="">All countries</option>
                            {countryOptions.map((country) => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>

                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="input w-full sm:w-56"
                            aria-label="Filter by city"
                        >
                            <option value="">All cities</option>
                            {cityOptions.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>

                        {(search || selectedCity || selectedCountry || params?.get('sort')) ? (
                            <button type="button" className="btn-secondary" onClick={resetFilters}>
                                Reset filters
                            </button>
                        ) : null}
                    </div>

                    <div className="hidden max-[799px]:block mt-3">
                        <input
                            name="q"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search events..."
                            className="w-full border-2 border-gray-800 px-3 py-2"
                        />
                    </div>

                    {events?.links && (
                        <CompactPagination links={events.links} className="justify-start" />
                    )}

                    <div className="hidden min-[800px]:grid min-[800px]:grid-cols-[minmax(0,1fr)_80px_80px_100px_100px] gap-4 p-3 text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                onClick={() => applySort('title')}
                                className="btn-primary text-left shrink-0"
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
                        >
                            Country
                            <span className="ml-1">{params?.get('sort')?.startsWith('country_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>
                        <button
                            onClick={() => applySort('city')}
                            className="text-center cursor-pointer btn-primary px-2 py-1 whitespace-normal break-words"
                        >
                            City
                            <span className="ml-1">{params?.get('sort')?.startsWith('city_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>
                        <button
                            onClick={() => applySort('start')}
                            className="text-center cursor-pointer btn-primary whitespace-nowrap"
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
                                        className="box max-[799px]:relative"
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
                                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                                                        <span>{formatEventDate(event.start_at)}</span>
                                                        <span>•</span>
                                                        <span>{event.city ?? 'City TBD'}{event.city && event.country ? ', ' : ''}{event.country ?? ''}</span>
                                                    </div>
                                                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm min-[800px]:hidden">
                                                        <span className="text-muted">{event.country ?? '—'}</span>
                                                        <span className="text-muted">{event.city ?? '—'}</span>
                                                        <span className="text-muted">{formatEventDate(event.start_at)}</span>
                                                        <span />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-sm text-muted text-center max-[799px]:hidden">{event.country ?? '—'}</div>
                                            <div className="text-sm text-muted text-center max-[799px]:hidden">{event.city ?? '—'}</div>
                                            <div className="text-sm text-muted text-center whitespace-nowrap max-[799px]:hidden">{formatEventDate(event.start_at)}</div>
                                            <div className="flex flex-col items-end text-right max-[799px]:absolute max-[799px]:top-3 max-[799px]:right-3">
                                                <Link
                                                    href={`/${event.slug}#tickets`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={ticketButtonClass}
                                                >
                                                    Buy Tickets
                                                </Link>
                                                {priceRange ? (
                                                    <div className="mt-1 w-full text-center text-sm text-base">
                                                        {priceRange}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-sm text-muted">
                                {(search || selectedCity || selectedCountry)
                                    ? 'No events match your current filters. Try resetting filters.'
                                    : 'No public events available.'}
                            </div>
                        )}
                    </div>
                    {events?.links && (
                        <CompactPagination links={events.links} className="justify-start" />
                    )}
                </section>

                <section className="mt-6 mb-10">
                    <div className="box">
                        <h2 className="text-xl font-semibold">Newsletter</h2>
                        <p className="mt-2 text-sm text-muted">Get updates about new events.</p>

                        {page.props?.flash?.newsletter_success && (
                            <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                                {page.props.flash.newsletter_success}
                            </div>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                newsletterForm.post('/newsletter/signup', {
                                    onSuccess: () => newsletterForm.reset('email'),
                                });
                            }}
                            className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
                        >
                            <div>
                                <label htmlFor="newsletter_email" className="block text-sm font-medium">Email</label>
                                <input
                                    id="newsletter_email"
                                    name="email"
                                    type="email"
                                    required
                                    value={newsletterForm.data.email}
                                    onChange={e => newsletterForm.setData('email', e.target.value)}
                                    className="input"
                                    placeholder="you@example.com"
                                />
                                {newsletterForm.errors.email && <div className="mt-1 text-sm text-red-600">{newsletterForm.errors.email}</div>}
                            </div>
                            <div className="flex items-end">
                                <button type="submit" className="btn-primary" disabled={newsletterForm.processing}>
                                    Subscribe
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
                </div>
            </main>
        </AppLayout>
    );
}

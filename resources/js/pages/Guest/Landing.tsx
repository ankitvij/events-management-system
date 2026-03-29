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
    const ticketButtonClass = 'guest-ticket-btn';
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
                <section className="mt-4 min-[800px]:mt-6">
                    <div className="guest-surface mt-3 p-3 shadow-sm min-[800px]:p-4">
                        <div className="grid grid-cols-2 gap-2 min-[800px]:grid-cols-[minmax(0,1fr)_14rem_14rem_auto]">
                            <input
                                name="q"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search events..."
                                className="input h-10 w-full !bg-white col-span-2 min-[800px]:col-span-1"
                            />

                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="input h-10 w-full !bg-white"
                                aria-label="Filter by city"
                            >
                                <option value="">All cities</option>
                                {cityOptions.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>

                            <select
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                                className="input h-10 w-full !bg-white"
                                aria-label="Filter by country"
                            >
                                <option value="">All countries</option>
                                {countryOptions.map((country) => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>

                            {(search || selectedCity || selectedCountry || params?.get('sort')) ? (
                                <button type="button" className="guest-accent-btn col-span-2 w-full min-[800px]:col-span-1 min-[800px]:justify-self-end min-[800px]:w-auto" onClick={resetFilters}>
                                    Reset filters
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {events?.links && (
                        <CompactPagination links={events.links} className="mt-3 justify-center min-[800px]:justify-start" />
                    )}

                    <div className="hidden min-[800px]:grid min-[800px]:grid-cols-[minmax(0,1fr)_80px_80px_100px_140px] gap-4 p-3 text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                onClick={() => applySort('title')}
                                className="!bg-transparent !text-[#6b7280] p-0 text-left text-sm font-semibold transition-colors hover:!text-[#111827]"
                            >
                                Event
                                <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('title_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                            </button>
                        </div>
                        <button
                            onClick={() => applySort('country')}
                            className="!bg-transparent !text-[#6b7280] p-0 text-center text-sm font-semibold transition-colors hover:!text-[#111827]"
                        >
                            Country
                            <span className="ml-1">{params?.get('sort')?.startsWith('country_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>
                        <button
                            onClick={() => applySort('city')}
                            className="!bg-transparent !text-[#6b7280] p-0 text-center text-sm font-semibold transition-colors hover:!text-[#111827]"
                        >
                            City
                            <span className="ml-1">{params?.get('sort')?.startsWith('city_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>
                        <button
                            onClick={() => applySort('start')}
                            className="!bg-transparent !text-[#6b7280] p-0 text-center text-sm font-semibold transition-colors hover:!text-[#111827]"
                        >
                            Date
                            <span className="ml-1">{params?.get('sort')?.startsWith('start_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>

                    </div>

                    <div className="space-y-2 px-2 min-[800px]:space-y-3 min-[800px]:px-0">
                        {events?.data?.length ? (
                            events.data.map((event: Event) => {
                                const priceRange = formatTicketRange(event);

                                return (
                                    <div
                                        key={event.id}
                                        className="box border-[#d1d5db] bg-white shadow-none hover:bg-[#f9fafb] max-[799px]:border-0 max-[799px]:bg-transparent max-[799px]:p-0 max-[799px]:shadow-none max-[799px]:hover:bg-transparent"
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
                                        <div className="min-[800px]:hidden overflow-hidden rounded-xl border border-[#d1d5db] bg-white">
                                            <div className="grid grid-cols-[6.9rem_minmax(0,1fr)]">
                                                <div className="h-full min-h-[6.75rem] overflow-hidden bg-[#cfd4dd]">
                                                    <img
                                                        src={event.image_thumbnail ? `/storage/${event.image_thumbnail}` : (event.image ? `/storage/${event.image}` : '/images/default-event.svg')}
                                                        alt={event.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex min-w-0 flex-col p-3">
                                                    <div className="text-[1.1rem] font-semibold leading-tight break-words whitespace-normal text-foreground">{event.title}</div>
                                                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                                                        <span>{event.city ?? 'City TBD'}</span>
                                                        <span className="text-[#f97316]">•</span>
                                                        <span>{formatEventDate(event.start_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-end border-t border-[#e5e7eb] px-3 py-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-[1.1rem] font-semibold leading-none text-[#6b7280]">
                                                        {(priceRange ? priceRange.replace('-', ' - ') : '€0.00')}
                                                    </div>
                                                    <Link
                                                        href={`/${event.slug}#tickets`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className={`${ticketButtonClass} h-10 px-4`}
                                                    >
                                                        Buy Tickets
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="hidden min-[800px]:grid min-[800px]:grid-cols-[minmax(0,1fr)_80px_80px_100px_140px] gap-4 items-center">
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
                                                </div>
                                            </div>

                                            <div className="text-sm text-muted text-center">{event.country ?? '—'}</div>
                                            <div className="text-sm text-muted text-center">{event.city ?? '—'}</div>
                                            <div className="text-sm text-muted text-center whitespace-nowrap">{formatEventDate(event.start_at)}</div>
                                            <div className="flex flex-col items-end text-right">
                                                <Link
                                                    href={`/${event.slug}#tickets`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={`${ticketButtonClass} h-10 px-5`}
                                                >
                                                    Buy Tickets
                                                </Link>
                                                {priceRange ? (
                                                    <div className="mt-1 w-full text-center text-sm font-medium text-[#9ca3af]">
                                                        {priceRange}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="rounded-xl border border-dashed border-[#d1d5db] bg-white p-4 text-sm text-muted">
                                {(search || selectedCity || selectedCountry)
                                    ? 'No events match your current filters. Try resetting filters.'
                                    : 'No public events available.'}
                            </div>
                        )}
                    </div>
                    {events?.links && (
                        <CompactPagination links={events.links} className="mt-3 justify-center min-[800px]:justify-start" />
                    )}
                </section>

                <section className="mt-6 mb-10">
                    <div className="box border-[#d1d5db] bg-white shadow-none hover:bg-white">
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
                                <button type="submit" className="guest-accent-btn" disabled={newsletterForm.processing}>
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

import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ShoppingCart,
    Ticket,
    PlusCircle,
    Calendar,
    Users,
    Mic2,
    Megaphone,
    Store,
} from 'lucide-react';
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
    const [guestSidebarCollapsed, setGuestSidebarCollapsed] = useState(false);
    const ticketButtonClass = 'btn-primary';
    const page = usePage<{ flash?: { success?: string; error?: string } }>();

    const artistForm = useForm({
        name: '',
        email: '',
        city: '',
        experience_years: 0,
        skills: '',
        description: '',
        equipment: '',
        photo: null as File | null,
    });

    const artistLoginForm = useForm({
        email: '',
    });

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

    const guestMenuItems = [
        { href: '/customer/orders', label: 'My orders', shortLabel: 'Orders', icon: ShoppingCart },
        { href: '/customer/orders', label: 'My tickets', shortLabel: 'Tickets', icon: Ticket },
        { href: '/events/create', label: 'Create event', shortLabel: 'Create', icon: PlusCircle },
        { href: '/events', label: 'My events', shortLabel: 'Events', icon: Calendar },
        { href: '/organisers', label: 'Organisers', shortLabel: 'Orgs', icon: Users },
        { href: '/artists', label: 'Artists', shortLabel: 'Artists', icon: Mic2 },
        { href: '/promoters', label: 'Promoters', shortLabel: 'Promoters', icon: Megaphone },
        { href: '/vendors', label: 'Vendors', shortLabel: 'Vendors', icon: Store },
    ];

    return (
        <AppLayout>
            <Head title="Welcome to Events">
                {[
                    <meta key="description" name="description" content="Public landing page for guests" />,
                ]}
            </Head>



            <main className="w-full mt-6">
                <div className="flex items-start gap-4">
                    <aside className={`box sticky top-4 shrink-0 transition-all duration-200 ${guestSidebarCollapsed ? 'w-24' : 'w-64'}`}>
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-xl font-semibold">Menu</h2>
                            <button
                                type="button"
                                className="btn-secondary px-2 py-1"
                                onClick={() => setGuestSidebarCollapsed((value) => !value)}
                                aria-label={guestSidebarCollapsed ? 'Expand guest menu' : 'Collapse guest menu'}
                            >
                                {guestSidebarCollapsed ? '»' : '«'}
                            </button>
                        </div>

                        <nav className="mt-3 flex flex-col gap-2">
                            {guestMenuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href + item.label}
                                        href={item.href}
                                        className="btn-secondary flex items-center gap-3 text-left justify-start"
                                    >
                                        <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                                        {!guestSidebarCollapsed && <span>{item.label}</span>}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>

                    <div className="min-w-0 flex-1">

                <section className="mt-6">
                    <div className="box">
                        <h2 className="text-xl font-semibold">Artist signup</h2>

                        {page.props?.flash?.success && (
                            <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                                {page.props.flash.success}
                            </div>
                        )}

                        {Object.keys(artistForm.errors).length > 0 && (
                            <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
                                <p className="font-semibold">Please fix the following:</p>
                                <ul className="list-disc pl-5">
                                    {Object.values(artistForm.errors).map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                artistForm.post('/artists/signup', {
                                    forceFormData: true,
                                    onSuccess: () => artistForm.reset('name', 'email', 'city', 'experience_years', 'skills', 'description', 'equipment', 'photo'),
                                });
                            }}
                            className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
                        >
                            <div>
                                <label htmlFor="artist_name" className="block text-sm font-medium">Name <span className="text-red-600">*</span></label>
                                <input id="artist_name" name="name" required value={artistForm.data.name} onChange={e => artistForm.setData('name', e.target.value)} className="input" />
                            </div>

                            <div>
                                <label htmlFor="artist_email" className="block text-sm font-medium">Email <span className="text-red-600">*</span></label>
                                <input id="artist_email" name="email" type="email" required value={artistForm.data.email} onChange={e => artistForm.setData('email', e.target.value)} className="input" />
                            </div>

                            <div>
                                <label htmlFor="artist_city" className="block text-sm font-medium">City <span className="text-red-600">*</span></label>
                                <input id="artist_city" name="city" required value={artistForm.data.city} onChange={e => artistForm.setData('city', e.target.value)} className="input" />
                            </div>

                            <div>
                                <label htmlFor="artist_experience" className="block text-sm font-medium">Experience (years) <span className="text-red-600">*</span></label>
                                <input id="artist_experience" name="experience_years" type="number" min={0} max={80} required value={artistForm.data.experience_years} onChange={e => artistForm.setData('experience_years', Number(e.target.value))} className="input" />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="artist_skills" className="block text-sm font-medium">Skills <span className="text-red-600">*</span></label>
                                <textarea id="artist_skills" name="skills" required value={artistForm.data.skills} onChange={e => artistForm.setData('skills', e.target.value)} className="input" rows={3} />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="artist_equipment" className="block text-sm font-medium">Equipment</label>
                                <textarea id="artist_equipment" name="equipment" value={artistForm.data.equipment} onChange={e => artistForm.setData('equipment', e.target.value)} className="input" rows={3} />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="artist_description" className="block text-sm font-medium">Description</label>
                                <textarea id="artist_description" name="description" value={artistForm.data.description} onChange={e => artistForm.setData('description', e.target.value)} className="input" rows={4} />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="artist_photo" className="block text-sm font-medium">Photo <span className="text-red-600">*</span></label>
                                <input id="artist_photo" name="photo" type="file" required onChange={e => artistForm.setData('photo', e.target.files?.[0] ?? null)} accept="image/*" />
                            </div>

                            <div className="md:col-span-2">
                                <button type="submit" className="btn-primary" disabled={artistForm.processing}>
                                    Sign up as an artist
                                </button>
                            </div>
                        </form>

                        <p className="mt-3 text-sm text-muted">
                            After signing up, we’ll email you a verification link to activate your account.
                        </p>

                        <div className="mt-6 border-t pt-4">
                            <h3 className="text-sm font-medium">Already an artist?</h3>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    artistLoginForm.post('/artists/login/token', {
                                        onSuccess: () => artistLoginForm.reset('email'),
                                    });
                                }}
                                className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
                            >
                                <div>
                                    <label htmlFor="artist_login_email" className="block text-sm font-medium">Email</label>
                                    <input
                                        id="artist_login_email"
                                        name="email"
                                        type="email"
                                        required
                                        value={artistLoginForm.data.email}
                                        onChange={e => artistLoginForm.setData('email', e.target.value)}
                                        className="input"
                                    />
                                    {artistLoginForm.errors.email && <div className="mt-1 text-sm text-red-600">{artistLoginForm.errors.email}</div>}
                                </div>
                                <div className="flex items-end">
                                    <button type="submit" className="btn-secondary" disabled={artistLoginForm.processing}>
                                        Email sign-in link
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>

                <section className="mt-6">
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
                            <div className="text-sm text-muted">No public events available.</div>
                        )}
                    </div>
                    {events?.links && (
                        <nav className="mt-6 flex items-center justify-start gap-2 pagination">
                            {events.links.map((l: PaginationLink, idx: number) => {
                                let label = l.label || '';
                                label = label.replace(/Previous/gi, '‹').replace(/Next/gi, '›');
                                label = label.replace(/&laquo;|«|&lsaquo;|‹/g, '‹').replace(/&raquo;|»|&rsaquo;|›/g, '›');
                                label = label.replace(/\s*‹\s*‹\s*/g, '‹').replace(/\s*›\s*›\s*/g, '›');
                                label = label.replace(/‹+/g, '‹').replace(/›+/g, '›');
                                return l.url ? (
                                    <Link
                                        key={idx}
                                        href={l.url}
                                        className={l.active ? 'btn-primary' : 'btn-ghost'}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: label }} />
                                    </Link>
                                ) : (
                                    <span
                                        key={idx}
                                        className="btn-ghost opacity-60 cursor-not-allowed"
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                );
                            })}
                        </nav>
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
                </div>
            </main>
        </AppLayout>
    );
}

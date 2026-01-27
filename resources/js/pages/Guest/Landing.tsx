import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import PublicHeader from '@/components/public-header';

type Props = {
    events?: any;
    cities?: string[];
    countries?: string[];
};

export default function GuestLanding({ events, cities, countries }: Props) {
    const page = usePage();

    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const sort = params?.get('sort') ?? '';

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
        router.get(`${window.location.pathname}${q ? `?${q}` : ''}`);
    }

    return (
        <AppLayout>
            <Head>
                <title>Welcome to Events</title>
                <meta name="description" content="Public landing page for guests" />
            </Head>

            <PublicHeader />

            <main className="max-w-5xl mx-auto py-16 px-4">
                <section className="mt-16">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            {events?.links?.map((l: any, idx: number) => (
                                l.url ? (
                                    <Link key={idx} href={l.url} className={`px-3 py-1 rounded ${l.active ? 'bg-gray-900 text-white' : 'bg-white border'}`}>
                                        <span dangerouslySetInnerHTML={{ __html: l.label }} />
                                    </Link>
                                ) : (
                                    <span key={idx} className="px-3 py-1 rounded text-muted" dangerouslySetInnerHTML={{ __html: l.label }} />
                                )
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <select value={params?.get('city') ?? ''} onChange={e => applyFilters({ city: e.target.value || null, page: null })} className="input">
                                <option value="">All cities</option>
                                {(cities ?? []).map((c: string) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <select value={params?.get('country') ?? ''} onChange={e => applyFilters({ country: e.target.value || null, page: null })} className="input">
                                <option value="">All countries</option>
                                {(countries ?? []).map((c: string) => (
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
                        {events?.data?.length ? (
                            events.data.map((event: any) => (
                                <div key={event.id} className="border rounded p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-20 h-12 flex-shrink-0">
                                            <img
                                                src={event.image_thumbnail ? `/storage/${event.image_thumbnail}` : (event.image ? `/storage/${event.image}` : '/images/default-event.svg')}
                                                alt={event.title}
                                                className="w-full h-full object-cover rounded"
                                            />
                                        </div>
                                        <div>
                                            <Link href={`/events/${event.id}`} className="text-lg font-medium">{event.title}</Link>
                                            <div className="text-sm text-muted">{event.location}{event.city ? ` · ${event.city}` : ''}{event.country ? `, ${event.country}` : ''}</div>
                                            <div className="text-sm text-muted mt-1">{event.start_at ? `Starts: ${new Date(event.start_at).toLocaleString()}` : 'Starts: —'}</div>
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
                            {events.links.map((l: any, idx: number) => (
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

                <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 border rounded-lg">
                        <h3 className="font-semibold mb-2">Create Events</h3>
                        <p className="text-sm text-muted">Quickly create events with images, locations and organisers.</p>
                    </div>
                    <div className="p-6 border rounded-lg">
                        <h3 className="font-semibold mb-2">Manage Teams</h3>
                        <p className="text-sm text-muted">Invite organisers and coordinate schedules and roles.</p>
                    </div>
                    <div className="p-6 border rounded-lg">
                        <h3 className="font-semibold mb-2">Stay Notified</h3>
                        <p className="text-sm text-muted">Keep attendees informed with notifications and updates.</p>
                    </div>
                </section>
            </main>
        </AppLayout>
    );
}

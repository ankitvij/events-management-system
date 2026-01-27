import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    events: any;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Events', href: '/events' },
];

export default function EventsIndex({ events }: Props) {
    const page = usePage();
    const current = page.props?.auth?.user;
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const activeFilter = params?.get('active') ?? 'all';

    function toggleActive(eventId: number, value: boolean) {
        router.put(`/events/${eventId}`, { active: value });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head>
                <title>Events</title>
                <meta name="description" content="Browse upcoming events." />
            </Head>

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-semibold">Events</h1>
                        <select value={activeFilter} onChange={e => router.get(`/events?active=${e.target.value}`)} className="input">
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <Link href="/events/create" className="btn-primary">New Event</Link>
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
                                        <div className="text-sm text-muted">{event.location}</div>
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
        </AppLayout>
    );
}

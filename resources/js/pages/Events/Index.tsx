import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    events: any;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Events', href: '/events' },
];

export default function EventsIndex({ events }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Events" />

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-semibold">Events</h1>
                    <Link href="/events/create" className="btn-primary">New Event</Link>
                </div>

                <div className="grid gap-3">
                    {events.data?.map((event: any) => (
                        <div key={event.id} className="border rounded p-3">
                            <div className="flex justify-between">
                                <div>
                                    <Link href={`/events/${event.id}`} className="text-lg font-medium">{event.title}</Link>
                                    <div className="text-sm text-muted">{event.location}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/events/${event.id}/edit`} className="text-sm text-blue-600">Edit</Link>
                                    <form action={`/events/${event.id}`} method="post" className="inline">
                                        <input type="hidden" name="_method" value="delete" />
                                        <button className="text-sm text-red-600" type="submit">Delete</button>
                                    </form>
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

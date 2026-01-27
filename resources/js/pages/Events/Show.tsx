import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = { event: any };

export default function Show({ event }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Events', href: '/events' },
        { title: event.title, href: `/events/${event.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={event.title} />

            <div className="p-4">
                {event.image && (
                    <div className="mb-4">
                        <img src={`/storage/${event.image}`} alt={event.title} className="max-w-full h-auto rounded" />
                    </div>
                )}
                <h1 className="text-2xl font-semibold">{event.title}</h1>
                <div className="text-sm text-muted">{event.location}</div>
                <div className="mt-4">{event.description}</div>

                <div className="mt-6">
                    <Link href={`/events/${event.id}/edit`} className="btn">Edit</Link>
                </div>
            </div>
        </AppLayout>
    );
}

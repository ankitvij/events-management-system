import { Head, Link } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { Event } from '@/types/entities';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

type Props = {
    events?: Event[];
};

export default function Dashboard({ events = [] }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>

                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>

                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {/* Upcoming events list */}
                    <div>
                        <h2 className="text-lg font-semibold">Upcoming Events</h2>

                        {events.length === 0 ? (
                            <div className="text-sm text-muted mt-2">No upcoming events.</div>
                        ) : (
                            <div className="grid gap-3 mt-2">
                                {events.map((event: Event) => (
                                    <div key={event.id} className="border rounded p-3 flex justify-between items-start">
                                        <div>
                                            <Link href={`/events/${event.slug}`} className="text-base font-medium">{event.title}</Link>
                                            <div className="text-sm text-muted">{event.city ?? ''}{event.city && event.country ? ', ' : ''}{event.country ?? ''}</div>
                                            <div className="text-sm text-muted">{new Date(event.start_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

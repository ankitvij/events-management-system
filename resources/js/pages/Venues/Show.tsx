import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
import ActionIcon from '@/components/action-icon';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Venue } from '@/types/entities';

type Props = {
    venue: Venue;
};

export default function VenuesShow({ venue }: Props) {
    const page = usePage<{ auth?: { user?: { role?: string; is_super_admin?: boolean } | null } }>();
    const canManage = !!page.props?.auth?.user && (page.props.auth.user.role === 'admin' || page.props.auth.user.role === 'agency' || page.props.auth.user.is_super_admin);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Venues', href: '/venues' },
        { title: venue.name, href: `/venues/${venue.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={venue.name} />

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{venue.name}</h1>
                        <div className="text-sm text-muted">{venue.email}</div>
                        <div className="text-sm text-muted">{venue.city || 'City TBD'}</div>
                        <div className="text-sm text-muted">Status: {venue.active ? 'Active' : 'Inactive'}</div>
                    </div>
                    <div className="flex gap-2">
                        {canManage ? (
                            <ActionIcon href={`/venues/${venue.id}/edit`} aria-label="Edit venue" title="Edit venue"><Pencil className="h-4 w-4" /></ActionIcon>
                        ) : null}
                        <Link href="/venues" className="btn-secondary" aria-label="Back to venues" title="Back to venues"><ArrowLeft className="h-4 w-4" /></Link>
                    </div>
                </div>

                {venue.description ? (
                    <div className="box">
                        <div className="whitespace-pre-wrap text-sm">{venue.description}</div>
                    </div>
                ) : null}
            </div>
        </AppLayout>
    );
}

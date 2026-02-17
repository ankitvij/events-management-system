import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Promoter = {
    id: number;
    name?: string | null;
    email?: string | null;
    active?: boolean;
    promoted_events_count?: number;
};

export default function PromotersShow({ promoter }: { promoter: Promoter }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Promoters', href: '/promoters' },
        { title: promoter.name ?? 'Promoter', href: `/promoters/${promoter.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={promoter.name ?? 'Promoter'} />

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{promoter.name ?? 'Promoter'}</h1>
                        <div className="text-sm text-muted">{promoter.email ?? '—'}</div>
                    </div>
                    <Link href="/promoters" className="btn-secondary" aria-label="Back to promoters" title="Back to promoters">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </div>

                <div className="box grid gap-2 text-sm">
                    <div><strong>Status:</strong> {promoter.active ? 'Active' : 'Inactive'}</div>
                    <div><strong>Promoted events:</strong> {promoter.promoted_events_count ?? 0}</div>
                </div>
            </div>
        </AppLayout>
    );
}

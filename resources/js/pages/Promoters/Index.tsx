import { Head, Link } from '@inertiajs/react';
import ListControls from '@/components/list-controls';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Pagination, PaginationLink, Promoter } from '@/types/entities';

type Props = {
    promoters: Pagination<Promoter>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Promoters', href: '/promoters' },
];

export default function PromotersIndex({ promoters }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Promoters" />

            <div className="p-4">
                <div className="mb-4">
                    <ListControls path="/promoters" links={promoters.links} showSearch searchPlaceholder="Search promoters..." />
                </div>

                <div className="grid gap-3">
                    {promoters.data?.map((p: Promoter) => (
                        <div key={p.id} className="border rounded p-3">
                            <div className="font-medium break-words">{p.name ?? 'Promoter'}</div>
                            {p.email ? <div className="text-sm text-muted break-words">{p.email}</div> : null}
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    {promoters.links?.map((link: PaginationLink) => (
                        link.url ? (
                            <Link
                                key={String(link.label)}
                                href={link.url}
                                className={link.active ? 'font-medium px-2' : 'text-muted px-2'}
                                as="a"
                                preserveScroll
                            >
                                <span dangerouslySetInnerHTML={{ __html: String(link.label) }} />
                            </Link>
                        ) : (
                            <span key={String(link.label)} className="px-2" dangerouslySetInnerHTML={{ __html: String(link.label) }} />
                        )
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

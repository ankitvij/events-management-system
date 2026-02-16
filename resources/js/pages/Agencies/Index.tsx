import { Head, Link, usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import CompactPagination from '@/components/compact-pagination';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Pagination } from '@/types/entities';

type Agency = {
    id: number;
    name: string;
    email?: string | null;
    active?: boolean;
};

type Props = {
    agencies: Pagination<Agency>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Agencies', href: '/agencies' },
];

export default function AgenciesIndex({ agencies }: Props) {
    const page = usePage<{ auth?: { user?: { is_super_admin?: boolean; role?: string } } }>();
    const canManage = !!page.props?.auth?.user && (page.props.auth.user.is_super_admin || page.props.auth.user.role === 'admin');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Agencies" />

            <div className="p-4">
                {canManage ? (
                    <div className="mb-4 flex justify-end">
                        <ActionButton href="/agencies/create">New Agency</ActionButton>
                    </div>
                ) : null}

                <CompactPagination links={agencies.links} />

                <div className="grid gap-3">
                    {agencies.data?.map((agency) => (
                        <div key={agency.id} className="box">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
                                <div className="md:col-span-7">
                                    <Link href={`/agencies/${agency.id}`} className="text-lg font-medium">{agency.name}</Link>
                                </div>
                                <div className="md:col-span-3 text-sm text-muted">{agency.email ?? '—'}</div>
                                <div className="md:col-span-2 flex items-center justify-start gap-2 md:justify-end">
                                    {canManage ? (
                                        <>
                                            <Link href={`/agencies/${agency.id}/edit`} className="btn-secondary" aria-label="Edit agency" title="Edit agency"><Pencil className="h-4 w-4" /></Link>
                                            <form action={`/agencies/${agency.id}`} method="post" className="inline">
                                                <input type="hidden" name="_method" value="delete" />
                                                <button className="btn-danger" type="submit" aria-label="Delete agency" title="Delete agency"><Trash2 className="h-4 w-4" /></button>
                                            </form>
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <CompactPagination links={agencies.links} />
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import ActionIcon from '@/components/action-icon';
import ActionButton from '@/components/ActionButton';
import ActiveToggleButton from '@/components/active-toggle-button';
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

    function toggleActive(id: number, value: boolean) {
        router.put(`/agencies/${id}/active`, { active: value });
    }

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
                                    <div className="flex items-center gap-2">
                                        <Link href={`/agencies/${agency.id}`} className="text-lg font-medium">{agency.name}</Link>
                                        {!agency.active && (
                                            <span className="text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">Inactive</span>
                                        )}
                                    </div>
                                </div>
                                <div className="md:col-span-3 text-sm text-muted">{agency.email ?? '—'}</div>
                                <div className="md:col-span-2 flex items-center justify-start gap-2 md:justify-end">
                                    {canManage ? (
                                        <>
                                            <ActiveToggleButton
                                                active={!!agency.active}
                                                onToggle={() => toggleActive(agency.id, !agency.active)}
                                                label="agency"
                                            />
                                            <ActionIcon href={`/agencies/${agency.id}/edit`} aria-label="Edit agency" title="Edit agency"><Pencil className="h-4 w-4" /></ActionIcon>
                                            <ActionIcon
                                                danger
                                                onClick={() => router.delete(`/agencies/${agency.id}`)}
                                                aria-label="Delete agency"
                                                title="Delete agency"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </ActionIcon>
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

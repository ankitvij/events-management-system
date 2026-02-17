import { Head, Link, router, usePage } from '@inertiajs/react';
import ActionButton from '@/components/ActionButton';
import ActiveToggleButton from '@/components/active-toggle-button';
import CompactPagination from '@/components/compact-pagination';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Pagination, Promoter } from '@/types/entities';

type Props = {
    promoters: Pagination<Promoter>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Promoters', href: '/promoters' },
];

export default function PromotersIndex({ promoters }: Props) {
    const page = usePage<{ auth?: { user?: { role?: string; is_super_admin?: boolean } } }>();
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const canManage = !!page.props?.auth?.user && (page.props.auth.user.role === 'admin' || page.props.auth.user.is_super_admin);

    function toggleActive(id: number, value: boolean) {
        router.put(`/users/${id}/active`, { active: value });
    }

    function applySort(key: string) {
        const cur = params?.get('sort') ?? '';
        let next = '';
        if (cur === `${key}_asc`) next = `${key}_desc`;
        else if (cur === `${key}_desc`) next = '';
        else next = `${key}_asc`;
        applyFilters({ sort: next || null, page: null });
    }

    function applyFilters(updates: Record<string, string | null>) {
        if (typeof window === 'undefined') return;
        const sp = new URLSearchParams(window.location.search);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') {
                sp.delete(key);
            } else {
                sp.set(key, value);
            }
        });
        router.get(`/promoters${sp.toString() ? `?${sp.toString()}` : ''}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Promoters" />

            <div className="p-4">
                <div className="mb-4 flex justify-end">
                    <div className="flex flex-wrap gap-2">
                        {canManage ? (
                            <ActionButton href="/users/create">New Promoter</ActionButton>
                        ) : (
                            <>
                                <ActionButton href="/promoters/signup">Signup as Promoter</ActionButton>
                                <Link href="/login" className="btn-secondary">Sign in as Promoter</Link>
                            </>
                        )}
                    </div>
                </div>

                <CompactPagination links={promoters.links} />

                <div className="mb-2 hidden md:grid md:grid-cols-12 gap-4 text-sm text-muted">
                    <div className="md:col-span-6 flex items-center gap-3">
                        <button onClick={() => applySort('name')} className="btn-primary shrink-0">
                            Name
                            <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('name_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>
                        <input
                            value={params?.get('q') ?? ''}
                            onChange={(e) => applyFilters({ q: e.target.value || null, page: null })}
                            placeholder="Search promoters..."
                            className="input w-full"
                        />
                    </div>
                    <button onClick={() => applySort('email')} className="btn-primary md:col-span-4 w-full justify-start min-w-max whitespace-nowrap">
                        Email
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('email_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                    <div className="md:col-span-2" />
                </div>

                <div className="grid gap-3">
                    {promoters.data?.map((p: Promoter) => (
                        <div key={p.id} className="box">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
                                <div className="md:col-span-6 font-medium break-words">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/promoters/${p.id}`} className="text-lg font-medium break-words">
                                            {p.name ?? 'Promoter'}
                                        </Link>
                                        {!p.active && (
                                            <span className="text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">Inactive</span>
                                        )}
                                    </div>
                                </div>
                                <div className="md:col-span-4 text-sm text-muted break-words">{p.email ?? '—'}</div>
                                <div className="md:col-span-2 flex items-center justify-start md:justify-end">
                                    {canManage ? (
                                        <ActiveToggleButton
                                            active={!!p.active}
                                            onToggle={() => toggleActive(p.id, !p.active)}
                                            label="promoter"
                                        />
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <CompactPagination links={promoters.links} />
                </div>
            </div>
        </AppLayout>
    );
}

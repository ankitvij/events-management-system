import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import CompactPagination from '@/components/compact-pagination';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Pagination, Organiser } from '@/types/entities';

type Props = {
    organisers: Pagination<Organiser>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Organisers', href: '/organisers' },
];

export default function OrganisersIndex({ organisers }: Props) {
    const page = usePage<{ auth?: { user?: { role?: string; is_super_admin?: boolean } } }>();
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const canManage = !!page.props?.auth?.user && (page.props.auth.user.role === 'admin' || page.props.auth.user.is_super_admin);




    function toggleActive(id: number, value: boolean) {
        router.put(`/organisers/${id}`, { active: value });
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
        router.get(`/organisers${sp.toString() ? `?${sp.toString()}` : ''}`);
    }



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Organisers" />

            <div className="p-4">
                <div className="mb-4 flex justify-end">
                    <div className="flex flex-wrap gap-2">
                        {canManage ? (
                            <ActionButton href="/organisers/create">New Organiser</ActionButton>
                        ) : (
                            <>
                                <ActionButton href="/register">Signup as Organiser</ActionButton>
                                <Link href="/login" className="btn-secondary">Sign in as Organiser</Link>
                            </>
                        )}
                    </div>
                </div>

                <CompactPagination links={organisers.links} />

                <div className="hidden md:grid md:grid-cols-12 gap-4 mb-2 text-sm text-muted">
                    <div className="md:col-span-8 flex items-center gap-3">
                        <button
                            onClick={() => applySort('name')}
                            className="btn-primary shrink-0"
                        >
                            Name
                            <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('name_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>
                        <input
                            value={params?.get('q') ?? ''}
                            onChange={(e) => applyFilters({ q: e.target.value || null, page: null })}
                            placeholder="Search organisers..."
                            className="input w-full"
                        />
                    </div>
                    <button
                        onClick={() => applySort('email')}
                        className="btn-primary md:col-span-3 w-full justify-start min-w-max whitespace-nowrap"
                    >
                        Email
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('email_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                    <div className="md:col-span-1" />
                </div>

                <div>
                    <div className="grid gap-3">
                    {organisers.data?.map((org: Organiser) => (
                        <div key={org.id} className="box">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
                                <div className="md:col-span-8">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/organisers/${org.id}`} className="text-lg font-medium">{org.name}</Link>
                                        {!org.active && (
                                            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">Inactive</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm text-muted md:col-span-3">{org.email}</div>
                                <div className="md:col-span-1">
                                {canManage ? (
                                    <div className="flex gap-2 items-center justify-start md:justify-end">
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() => toggleActive(org.id, !org.active)}
                                            aria-label={org.active ? 'Set organiser inactive' : 'Set organiser active'}
                                            title={org.active ? 'Set inactive' : 'Set active'}
                                        >
                                            {org.active ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                                        </button>

                                        <div className="flex gap-2">
                                            <Link href={`/organisers/${org.id}/edit`} className="btn-secondary px-3 py-1 text-sm" aria-label="Edit organiser" title="Edit organiser"><Pencil className="h-4 w-4" /></Link>
                                            <form action={`/organisers/${org.id}`} method="post" className="inline">
                                                <input type="hidden" name="_method" value="delete" />
                                                <button className="btn-danger" type="submit" aria-label="Delete organiser" title="Delete organiser"><Trash2 className="h-4 w-4" /></button>
                                            </form>
                                        </div>
                                    </div>
                                ) : null}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <CompactPagination links={organisers.links} />
                </div>
                </div>
            </div>
        </AppLayout>
    );
}

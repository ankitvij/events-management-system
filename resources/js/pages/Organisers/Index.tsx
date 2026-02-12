import { Head, Link, router, usePage } from '@inertiajs/react';
import ActionButton from '@/components/ActionButton';
import CompactPagination from '@/components/compact-pagination';
import ListControls from '@/components/list-controls';
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
        if (typeof window === 'undefined') return;
        const sp = new URLSearchParams(window.location.search);
        const cur = sp.get('sort') ?? '';
        let next = '';
        if (cur === `${key}_asc`) next = `${key}_desc`;
        else if (cur === `${key}_desc`) next = '';
        else next = `${key}_asc`;
        if (next === '') sp.delete('sort'); else sp.set('sort', next);
        sp.delete('page');
        router.get(`/organisers${sp.toString() ? `?${sp.toString()}` : ''}`);
    }



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Organisers" />

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <ListControls path="/organisers" links={organisers.links} showSearch searchPlaceholder="Search organisers..." />
                    </div>
                    <div className="flex gap-2">
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

                <div className="hidden md:grid md:grid-cols-12 gap-4 mb-2 text-sm text-muted">
                    <button
                        onClick={() => applySort('name')}
                        className="md:col-span-8 text-left min-w-max whitespace-nowrap"
                    >
                        Name
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('name_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                    <div className="md:col-span-3 min-w-max whitespace-nowrap">Email</div>
                    <div className="md:col-span-1" />
                </div>

                <div>
                    <div className="mb-4">
                        <CompactPagination links={organisers.links} />
                    </div>

                    <div className="grid gap-3">
                    {organisers.data?.map((org: Organiser) => (
                        <div key={org.id} className="box">
                            <div className="flex justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/organisers/${org.id}`} className="text-lg font-medium">{org.name}</Link>
                                        {!org.active && (
                                            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">Inactive</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted">{org.email}</div>
                                </div>
                                {canManage ? (
                                    <div className="flex gap-2 items-center">
                                        <label className="flex items-center mr-3">
                                            <input type="checkbox" checked={!!org.active} onChange={e => toggleActive(org.id, e.target.checked)} />
                                            <span className="ml-2 text-sm text-muted">Active</span>
                                        </label>

                                        <div className="flex gap-2">
                                            <Link href={`/organisers/${org.id}/edit`} className="btn-secondary px-3 py-1 text-sm">Edit</Link>
                                            <form action={`/organisers/${org.id}`} method="post" className="inline">
                                                <input type="hidden" name="_method" value="delete" />
                                                <button className="btn-danger" type="submit">Delete</button>
                                            </form>
                                        </div>
                                    </div>
                                ) : null}
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

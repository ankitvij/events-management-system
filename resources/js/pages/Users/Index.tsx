import { Head, Link, usePage, router } from '@inertiajs/react';
import { CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import CompactPagination from '@/components/compact-pagination';
import ListControls from '@/components/list-controls';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Pagination, UserShort } from '@/types/entities';

type UserRow = UserShort & {
    active?: boolean;
    role?: string;
    is_super_admin?: boolean;
};

type Props = { users: Pagination<UserRow> };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/users' },
];

export default function UsersIndex({ users }: Props) {
    const page = usePage<{ auth?: { user?: { id: number; role?: string; is_super_admin?: boolean } } }>();
    const current = page.props?.auth?.user;
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const paginationLinks = (users.links ?? []).map((link) => ({
        ...link,
        label: link.label ?? undefined,
    }));

    function toggleActive(userId: number, value: boolean) {
        router.put(`/users/${userId}`, { active: value });
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
        router.get(`/users${sp.toString() ? `?${sp.toString()}` : ''}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <ListControls path="/users" links={paginationLinks} showSearch={false} showActive />
                    </div>
                    <div className="flex gap-2">
                        <ActionButton href="/users/create">New User</ActionButton>
                    </div>
                </div>

                <CompactPagination links={users.links} />

                <div className="hidden md:grid md:grid-cols-12 gap-4 mb-2 text-sm text-muted">
                    <div className="md:col-span-6 flex items-center gap-3">
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
                            placeholder="Search users..."
                            className="input w-full"
                        />
                    </div>
                    <button
                        onClick={() => applySort('email')}
                        className="btn-primary md:col-span-4 w-full justify-start min-w-max whitespace-nowrap"
                    >
                        Email
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('email_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                    <div className="md:col-span-1 min-w-max whitespace-nowrap">Active</div>
                    <div className="md:col-span-1" />
                </div>

                <div>
                    <div className="grid gap-3">
                    {users.data?.map((user: UserRow) => (
                        <div key={user.id} className="box">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
                                <div className="md:col-span-6">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/users/${user.id}`} className="text-lg font-medium">{user.name}</Link>
                                        {!user.active && (
                                            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">Inactive</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm text-muted md:col-span-4">{user.email}</div>
                                <div className="md:col-span-2">
                                <div className="flex gap-2 items-center justify-start md:justify-end">
                                    {current && (current.is_super_admin || current.id === user.id || (current.role === 'admin' && user.role === 'user' && !user.is_super_admin)) && (
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() => toggleActive(user.id, !user.active)}
                                            aria-label={user.active ? 'Set user inactive' : 'Set user active'}
                                            title={user.active ? 'Set inactive' : 'Set active'}
                                        >
                                            {user.active ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                                        </button>
                                    )}

                                    <div className="flex gap-2">
                                    <Link href={`/users/${user.id}/edit`} className="btn-secondary px-3 py-1 text-sm" aria-label="Edit user" title="Edit user"><Pencil className="h-4 w-4" /></Link>
                                    <form action={`/users/${user.id}`} method="post" className="inline">
                                        <input type="hidden" name="_method" value="delete" />
                                        <button className="btn-danger" type="submit" aria-label="Delete user" title="Delete user"><Trash2 className="h-4 w-4" /></button>
                                    </form>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <CompactPagination links={users.links} />
                </div>
                </div>
            </div>
        </AppLayout>
    );
}

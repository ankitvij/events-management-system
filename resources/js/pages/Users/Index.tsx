import { Head, Link, usePage, router } from '@inertiajs/react';
import ActionButton from '@/components/ActionButton';
import ListControls from '@/components/list-controls';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Pagination, UserShort, PaginationLink } from '@/types/entities';

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
        if (typeof window === 'undefined') return;
        const sp = new URLSearchParams(window.location.search);
        const cur = sp.get('sort') ?? '';
        let next = '';
        if (cur === `${key}_asc`) next = `${key}_desc`;
        else if (cur === `${key}_desc`) next = '';
        else next = `${key}_asc`;
        if (next === '') sp.delete('sort'); else sp.set('sort', next);
        sp.delete('page');
        router.get(`/users${sp.toString() ? `?${sp.toString()}` : ''}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <ListControls path="/users" links={paginationLinks} showSearch showActive />
                    </div>
                    <div className="flex gap-2">
                        <ActionButton href="/users/create">New User</ActionButton>
                    </div>
                </div>

                <div className="hidden md:grid md:grid-cols-12 gap-4 mb-2 text-sm text-muted">
                    <button
                        onClick={() => applySort('name')}
                        className="md:col-span-6 text-left min-w-max whitespace-nowrap"
                    >
                        Name
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('name_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                    <div className="md:col-span-4 min-w-max whitespace-nowrap">Email</div>
                    <div className="md:col-span-1 min-w-max whitespace-nowrap">Active</div>
                    <div className="md:col-span-1" />
                </div>

                <div>
                    <div className="mb-4">
                        {users.links?.map((link) => (
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

                    <div className="grid gap-3">
                    {users.data?.map((user: UserRow) => (
                        <div key={user.id} className="box">
                            <div className="flex justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/users/${user.id}`} className="text-lg font-medium">{user.name}</Link>
                                        {!user.active && (
                                            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">Inactive</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted">{user.email}</div>
                                </div>
                                <div className="flex gap-2 items-center">
                                    {current && (current.is_super_admin || current.id === user.id || (current.role === 'admin' && user.role === 'user' && !user.is_super_admin)) && (
                                        <label className="flex items-center mr-3">
                                            <input type="checkbox" checked={!!user.active} onChange={e => toggleActive(user.id, e.target.checked)} />
                                            <span className="ml-2 text-sm text-muted">Active</span>
                                        </label>
                                    )}

                                    <div className="flex gap-2">
                                    <Link href={`/users/${user.id}/edit`} className="btn-secondary px-3 py-1 text-sm">Edit</Link>
                                    <form action={`/users/${user.id}`} method="post" className="inline">
                                        <input type="hidden" name="_method" value="delete" />
                                        <button className="btn-danger" type="submit">Delete</button>
                                    </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    {users.links?.map((link: PaginationLink, idx: number) => (
                        link.url ? (
                            <Link
                                key={String(link.label ?? link.url ?? idx)}
                                href={link.url}
                                className={link.active ? 'font-medium px-2' : 'text-muted px-2'}
                                as="a"
                                preserveScroll
                            >
                                <span dangerouslySetInnerHTML={{ __html: String(link.label ?? '') }} />
                            </Link>
                        ) : (
                            <span key={String(link.label ?? idx)} className="px-2" dangerouslySetInnerHTML={{ __html: String(link.label ?? '') }} />
                        )
                    ))}
                </div>
                </div>
            </div>
        </AppLayout>
    );
}

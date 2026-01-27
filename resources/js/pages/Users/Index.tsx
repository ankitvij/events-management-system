import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import ListControls from '@/components/list-controls';
import type { BreadcrumbItem } from '@/types';

type Props = { users: any };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/users' },
];

export default function UsersIndex({ users }: Props) {
    const page = usePage();
    const current = page.props?.auth?.user;
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const activeFilter = params?.get('active') ?? 'all';

    function toggleActive(userId: number, value: boolean) {
        router.put(`/users/${userId}`, { active: value });
    }
    const sort = params?.get('sort') ?? '';

    function applyFilters(updates: Record<string, string | null>) {
        if (typeof window === 'undefined') return;
        const sp = new URLSearchParams(window.location.search);
        Object.entries(updates).forEach(([k, v]) => {
            if (v === null || v === '') {
                sp.delete(k);
            } else {
                sp.set(k, v);
            }
        });
        const q = sp.toString();
        router.get(`/users${q ? `?${q}` : ''}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <ListControls
                        search={params?.get('q') ?? ''}
                        onSearch={(v) => applyFilters({ q: v || null, page: null })}
                        showActive
                        active={activeFilter}
                        onActiveChange={(v) => applyFilters({ active: v === 'all' ? null : v, page: null })}
                        sort={sort}
                        onSortChange={(v) => applyFilters({ sort: v || null, page: null })}
                    />
                    <Link href="/users/create" className="btn-primary">New User</Link>
                </div>

                <div className="grid gap-3">
                    {users.data?.map((user: any) => (
                        <div key={user.id} className="border rounded p-3">
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
                                    <Link href={`/users/${user.id}/edit`} className="text-sm text-blue-600">Edit</Link>
                                    <form action={`/users/${user.id}`} method="post" className="inline">
                                        <input type="hidden" name="_method" value="delete" />
                                        <button className="text-sm text-red-600" type="submit">Delete</button>
                                    </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    {users.links?.map((link: any) => (
                        link.url ? (
                            <Link
                                key={link.label}
                                href={link.url}
                                className={link.active ? 'font-medium px-2' : 'text-muted px-2'}
                                as="a"
                                preserveScroll
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Link>
                        ) : (
                            <span key={link.label} className="px-2" dangerouslySetInnerHTML={{ __html: link.label }} />
                        )
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

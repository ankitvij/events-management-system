import { Head, Link, usePage, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
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
    const initial = params?.get('q') ?? '';
    const [search, setSearch] = useState(initial);
    const timeoutRef = useRef<number | null>(null);
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const delay = 300;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
            router.get(`/users?q=${encodeURIComponent(search)}`);
        }, delay);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [search]);

    function toggleActive(userId: number, value: boolean) {
        router.put(`/users/${userId}`, { active: value });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="input" />

                        <select value={activeFilter} onChange={e => router.get(`/users?active=${e.target.value}`)} className="input">
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <Link href="/users/create" className="btn-primary">New User</Link>
                </div>

                <div>
                    <div className="mb-4">
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
            </div>
        </AppLayout>
    );
}

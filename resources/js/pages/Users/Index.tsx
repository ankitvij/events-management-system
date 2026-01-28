import { Head, Link, usePage, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
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
                        <ListControls path="/users" links={users.links} showSearch showActive />
                    </div>
                    <Link href="/users/create" className="btn-primary">New User</Link>
                </div>

                <div className="hidden md:grid md:grid-cols-12 gap-4 mb-2 text-sm text-muted">
                    <button
                        onClick={() => applySort('name')}
                        className="md:col-span-6 text-left"
                        aria-sort={params?.get('sort') === 'name_asc' ? 'ascending' : params?.get('sort') === 'name_desc' ? 'descending' : 'none'}
                    >
                        Name
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('name_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                    <div className="md:col-span-4">Email</div>
                    <div className="md:col-span-1">Active</div>
                    <div className="md:col-span-1" />
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

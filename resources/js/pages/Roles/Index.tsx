import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { UserShort } from '@/types/entities';

type Props = {
    roles: string[];
    users: UserShort[];
};

export default function RolesIndex({ roles, users }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Roles', href: '/roles' },
    ];

    const page = usePage();
    const currentId = page.props?.auth?.user?.id;
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

    function applyFilters(updates: Record<string, string | null>) {
        if (typeof window === 'undefined') return;
        if (!updates) return;
        const sp = new URLSearchParams(window.location.search);
        Object.entries(updates).forEach(([k, v]) => {
            if (v === null || v === '') {
                sp.delete(k);
            } else {
                sp.set(k, v);
            }
        });
        const q = sp.toString();
        router.get(`/roles${q ? `?${q}` : ''}`);
    }

    function applySort(key: string): void {
        const current = params?.get('sort') ?? '';
        let next = '';
        if (current === `${key}_asc`) {
            next = `${key}_desc`;
        } else if (current === `${key}_desc`) {
            next = '';
        } else {
            next = `${key}_asc`;
        }
        applyFilters({ sort: next || null, page: null });
    }

    function changeRole(userId: number, role: string) {
        // confirmation
        if (!confirm('Change role for this user?')) {
            return;
        }

        router.put(`/roles/users/${userId}`, { role });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />

            <div className="p-4">
                <div className="mb-2 hidden md:grid md:grid-cols-12 gap-4 text-sm text-muted">
                    <div className="md:col-span-5 flex items-center gap-3">
                        <button onClick={() => applySort('name')} className="btn-primary shrink-0">
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
                    <button onClick={() => applySort('email')} className="btn-primary md:col-span-5 w-full justify-start min-w-max whitespace-nowrap">
                        Email
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('email_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                    <div className="md:col-span-2" />
                </div>
                <div className="grid gap-2">
                    {users.map((u) => (
                        <div key={u.id} className="box">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
                            <div className="md:col-span-5">
                                <div className="text-lg font-medium">{u.name}</div>
                            </div>
                            <div className="text-sm text-muted md:col-span-5">{u.email}</div>
                            <div className="md:col-span-2">
                            <div className="flex items-center gap-2 justify-start md:justify-end">
                                <select
                                    value={u.role}
                                    onChange={(e) => changeRole(u.id, e.target.value)}
                                    className="input"
                                    aria-label={`Role for ${u.name}`}
                                    disabled={u.id === currentId}
                                >
                                    {roles.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => router.post(`/roles/users/${u.id}/undo`)}
                                    className="ml-2 text-sm text-red-600"
                                    title="Undo last change"
                                >
                                    Undo
                                </button>
                            </div>
                            </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

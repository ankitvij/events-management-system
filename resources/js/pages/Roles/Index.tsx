import { Head, usePage, router } from '@inertiajs/react';
import ListControls from '@/components/list-controls';
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
    const sort = params?.get('sort') ?? '';

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
                <ListControls
                    search={params?.get('q') ?? ''}
                    onSearch={(v) => applyFilters({ q: v || null, page: null })}
                    sort={sort}
                    onSortChange={(v) => applyFilters({ sort: v || null, page: null })}
                />

                <div className="grid gap-2">
                    {users.map((u) => (
                        <div key={u.id} className="box flex items-center justify-between">
                            <div>
                                <div className="text-lg font-medium">{u.name}</div>
                                <div className="text-sm text-muted">{u.email}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={u.role}
                                    onChange={(e) => changeRole(u.id, e.target.value)}
                                    className="input"
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
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    roles: string[];
    users: Array<any>;
};

export default function RolesIndex({ roles, users }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Roles', href: '/roles' },
    ];

    const page = usePage();
    const currentId = page.props?.auth?.user?.id;

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
                <h1 className="text-2xl font-semibold mb-4">Roles</h1>

                <div className="grid gap-2">
                    {users.map((u) => (
                        <div key={u.id} className="border rounded p-3 flex items-center justify-between">
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

import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { UserShort } from '@/types/entities';

type RoleChange = {
    id: number;
    created_at: string;
    changed_by?: UserShort | null;
    old_role?: string | null;
    new_role?: string | null;
};

export default function Show({ user, roleChanges = [] }: { user: UserShort; roleChanges?: RoleChange[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Users', href: '/users' },
        { title: user.name, href: `/users/${user.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />

            <div className="p-4">
                <h1 className="text-2xl font-semibold">{user.name}</h1>
                <div className="text-sm text-muted">{user.email}</div>

                <div className="mt-6">
                    <Link href={`/users/${user.id}/edit`} className="btn">Edit</Link>
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-medium">Role Change History</h2>
                    {roleChanges.length === 0 ? (
                        <div className="text-sm text-muted mt-2">No role changes recorded.</div>
                    ) : (
                        <ul className="mt-3 space-y-3">
                            {roleChanges.map((c: RoleChange) => (
                                <li key={c.id} className="p-3 border rounded">
                                    <div className="text-sm text-muted">{new Date(c.created_at).toLocaleString()}</div>
                                    <div className="mt-1">
                                        <strong className="mr-1">{c.changed_by ? c.changed_by.name : 'System'}</strong>
                                        changed role from <span className="font-medium">{c.old_role}</span> to <span className="font-medium">{c.new_role}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

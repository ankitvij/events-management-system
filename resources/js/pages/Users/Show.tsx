import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

export default function Show({ user }: any) {
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
            </div>
        </AppLayout>
    );
}

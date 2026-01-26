import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = { users: any };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/users' },
];

export default function UsersIndex({ users }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-semibold">Users</h1>
                    <Link href="/users/create" className="btn-primary">New User</Link>
                </div>

                <div className="grid gap-3">
                    {users.data?.map((user: any) => (
                        <div key={user.id} className="border rounded p-3">
                            <div className="flex justify-between">
                                <div>
                                    <Link href={`/users/${user.id}`} className="text-lg font-medium">{user.name}</Link>
                                    <div className="text-sm text-muted">{user.email}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/users/${user.id}/edit`} className="text-sm text-blue-600">Edit</Link>
                                    <form action={`/users/${user.id}`} method="post" className="inline">
                                        <input type="hidden" name="_method" value="delete" />
                                        <button className="text-sm text-red-600" type="submit">Delete</button>
                                    </form>
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

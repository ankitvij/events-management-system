import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Organiser } from '@/types/entities';

export default function Show({ organiser }: { organiser: Organiser }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Organisers', href: '/organisers' },
        { title: organiser.name, href: `/organisers/${organiser.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={organiser.name} />

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-semibold">{organiser.name}</h1>
                    <div className="flex gap-2">
                        <Link href={`/organisers/${organiser.id}/edit`} className="text-sm text-blue-600">Edit</Link>
                        <form action={`/organisers/${organiser.id}`} method="post" className="inline">
                            <input type="hidden" name="_method" value="delete" />
                            <button className="btn-danger" type="submit">Delete</button>
                        </form>
                    </div>
                </div>

                <div className="space-y-2">
                    <div><strong>Email:</strong> {organiser.email || '—'}</div>
                    <div><strong>Active:</strong> {organiser.active ? 'Yes' : 'No'}</div>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = { page: any };

export default function Show({ page }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pages', href: '/pages' },
        { title: page.title, href: `/pages/${page.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={page.title} />

            <div className="p-4">
                <h1 className="text-2xl font-semibold">{page.title}</h1>
                <div className="mt-4 prose" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
            </div>
        </AppLayout>
    );
}

import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { LooseObject } from '@/types/entities';

type Page = { id: number; title?: string | null; content?: string | null } & LooseObject;

type Props = { page: Page };

export default function Show({ page }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pages', href: '/pages' },
        { title: page.title, href: `/pages/${page.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={page.title} />

            <div className="p-4">
                <div className="mb-4">
                    <Link href="/pages" className="btn-secondary" aria-label="Back to pages" title="Back to pages"><ArrowLeft className="h-4 w-4" /></Link>
                </div>
                <h1 className="text-2xl font-semibold">{page.title}</h1>
                <div className="mt-4 prose" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
            </div>
        </AppLayout>
    );
}

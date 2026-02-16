import { Head, Link, router } from '@inertiajs/react';
import ActionButton from '@/components/ActionButton';
import CompactPagination from '@/components/compact-pagination';
import ListControls from '@/components/list-controls';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Pagination, LooseObject } from '@/types/entities';

type Props = { pages: Pagination<LooseObject> };

export default function Index({ pages }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pages', href: '/pages' },
    ];

    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

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
        router.get(`/pages${sp.toString() ? `?${sp.toString()}` : ''}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pages" />

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                                <ListControls path="/pages" links={pages.links} showSearch searchPlaceholder="Search pages..." />
                    </div>
                    <ActionButton href="/pages/create">New Page</ActionButton>
                </div>

                <CompactPagination links={pages.links} />

                <div className="hidden md:grid md:grid-cols-12 gap-4 mb-2 text-sm text-muted">
                    <button
                        onClick={() => applySort('title')}
                        className="md:col-span-8 text-left min-w-max whitespace-nowrap"
                    >
                        Title
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('title_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                    <div className="md:col-span-2 min-w-max whitespace-nowrap">Active</div>
                    <div className="md:col-span-2" />
                </div>

                <div>
                    <div className="grid gap-3">
                    {pages.data?.map((page: LooseObject) => (
                        <div key={page.id} className="box">
                            <div className="flex justify-between items-center">
                                <div>
                                    <Link href={`/pages/${page.id}`} className="text-lg font-medium">{page.title}</Link>
                                    {!page.active && <div className="text-sm text-muted">Inactive</div>}
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/pages/${page.id}/edit`} className="btn-secondary px-3 py-1 text-sm">Edit</Link>
                                    <form action={`/pages/${page.id}`} method="post" className="inline">
                                        <input type="hidden" name="_method" value="delete" />
                                        <button className="btn-danger" type="submit">Delete</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <CompactPagination links={pages.links} />
                </div>
                </div>
            </div>
        </AppLayout>
    );
}
